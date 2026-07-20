package com.quickcart.controller;

import com.quickcart.entity.Store;
import com.quickcart.entity.Inventory;
import com.quickcart.repository.StoreRepository;
import com.quickcart.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/stores/by-city")
    public ResponseEntity<?> getStoresByCity(@RequestParam String city) {
        List<Store> stores = storeRepository.findByCityIgnoreCase(city).stream()
                .filter(store -> "APPROVED".equals(store.getVerificationStatus()))
                .collect(Collectors.toList());
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
}
