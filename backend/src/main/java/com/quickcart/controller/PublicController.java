package com.quickcart.controller;

import com.quickcart.dto.NearbyStoreDto;
import com.quickcart.entity.Inventory;
import com.quickcart.entity.Store;
import com.quickcart.repository.StoreRepository;
import com.quickcart.service.InventoryService;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-stores")
    public ResponseEntity<?> fixStores() {
        // Update any stores with location (0,0) to standard Madanapalle coordinates
        int updated = jdbcTemplate.update(
            "UPDATE stores SET location = ST_SetSRID(ST_MakePoint(78.5028, 13.5532), 4326) WHERE ST_X(location::geometry) = 0"
        );
        return ResponseEntity.ok("Updated " + updated + " stores.");
    }

    // ─── existing endpoints ──────────────────────────────────────────────────

    @GetMapping("/stores")
    public ResponseEntity<?> getAllStores() {
        List<Store> stores = storeRepository.findAll().stream()
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/stores/by-city")
    public ResponseEntity<?> getStoresByCity(@RequestParam String city) {
        // Try exact match first, then fuzzy (LIKE)
        List<Store> stores = storeRepository.findByCityIgnoreCase(city).stream()
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .collect(Collectors.toList());
        // If empty, try partial match
        if (stores.isEmpty()) {
            stores = storeRepository.findAll().stream()
                    .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                    .filter(store -> store.getCity() != null && store.getCity().toLowerCase().contains(city.toLowerCase()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/stores/{storeId}/inventory")
    public ResponseEntity<?> getStoreInventory(@PathVariable Long storeId) {
        List<Inventory> inventoryList = inventoryService.getInventoryByStore(storeId);
        return ResponseEntity.ok(inventoryList);
    }

    @GetMapping("/stores/{storeId}")
    public ResponseEntity<?> getStoreById(@PathVariable Long storeId) {
        return storeRepository.findById(storeId)
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getAllInventory() {
        List<Store> stores = storeRepository.findAll().stream()
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .collect(Collectors.toList());
        List<Inventory> allInventory = new java.util.ArrayList<>();
        for (Store s : stores) {
            allInventory.addAll(inventoryService.getInventoryByStore(s.getId()));
        }
        return ResponseEntity.ok(allInventory);
    }

    @GetMapping("/inventory/by-city")
    public ResponseEntity<?> getInventoryByCity(@RequestParam String city) {
        List<Store> stores = storeRepository.findByCityIgnoreCase(city).stream()
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .collect(Collectors.toList());
        // If empty, try partial match
        if (stores.isEmpty()) {
            stores = storeRepository.findAll().stream()
                    .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                    .filter(store -> store.getCity() != null && store.getCity().toLowerCase().contains(city.toLowerCase()))
                    .collect(Collectors.toList());
        }
        List<Inventory> allInventory = new java.util.ArrayList<>();
        for (Store s : stores) {
            allInventory.addAll(inventoryService.getInventoryByStore(s.getId()));
        }
        return ResponseEntity.ok(allInventory);
    }

    // ─── Phase 2: Map & nearest-store endpoints ──────────────────────────────

    /**
     * GET /api/public/stores/nearby?lat=&lon=&limit=
     * Returns the nearest {@code limit} approved, open stores to the given
     * coordinate, ordered by distance ascending.
     */
    @GetMapping("/stores/nearby")
    public ResponseEntity<List<NearbyStoreDto>> getNearbyStores(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") int limit) {

        List<Store> stores = storeRepository.findNearestStores(lat, lon, limit);
        List<NearbyStoreDto> dtos = stores.stream()
                .map(s -> toDto(s, lat, lon))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/public/stores/within-radius?lat=&lon=&radiusKm=
     * Returns all approved, open stores within the given radius (km).
     */
    @GetMapping("/stores/within-radius")
    public ResponseEntity<List<NearbyStoreDto>> getStoresWithinRadius(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5") double radiusKm) {

        double radiusMetres = radiusKm * 1000.0;
        List<Store> stores = storeRepository.findStoresWithinRadius(lat, lon, radiusMetres);
        List<NearbyStoreDto> dtos = stores.stream()
                .map(s -> toDto(s, lat, lon))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private NearbyStoreDto toDto(Store store, double userLat, double userLon) {
        Point loc = store.getLocation();
        Double storeLat = loc != null ? loc.getY() : null;
        Double storeLng = loc != null ? loc.getX() : null;
        Double distKm   = (storeLat != null && storeLng != null)
                ? haversineKm(userLat, userLon, storeLat, storeLng)
                : null;

        NearbyStoreDto dto = new NearbyStoreDto();
        dto.setId(store.getId());
        dto.setName(store.getName());
        dto.setCity(store.getCity());
        dto.setAddress(store.getAddress());
        dto.setVerificationStatus(store.getVerificationStatus());
        dto.setIsOpen(store.getIsOpen());
        dto.setLogoUrl(store.getLogoUrl());
        dto.setBannerUrl(store.getBannerUrl());
        dto.setWhatsappNumber(store.getWhatsappNumber());
        dto.setFreshnessScore(store.getFreshnessScore() != null
                ? store.getFreshnessScore().doubleValue() : null);
        dto.setLat(storeLat);
        dto.setLng(storeLng);
        dto.setDistanceKm(distKm);
        return dto;
    }

    /** Haversine great-circle distance in kilometres. */
    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}

