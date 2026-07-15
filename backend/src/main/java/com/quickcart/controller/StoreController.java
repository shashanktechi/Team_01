package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.dto.request.OrderStatusUpdateRequest;
import com.quickcart.dto.request.StoreProductRequest;
import com.quickcart.dto.request.InventoryQuantityUpdateRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Inventory;
import com.quickcart.repository.OrderRepository;
import com.quickcart.service.InventoryService;
import com.quickcart.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/store")
@PreAuthorize("hasRole('STORE_ADMIN')")
@SuppressWarnings("null")
public class StoreController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.quickcart.service.VisionService visionService;

    @Autowired
    private com.quickcart.service.WeatherAnalyticsService weatherAnalyticsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private com.quickcart.repository.StoreRepository storeRepository;

    @Autowired
    private com.quickcart.repository.UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getStoreProfile() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        com.quickcart.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        com.quickcart.entity.Store store = null;
        if (storeId != null) {
            store = storeRepository.findById(storeId).orElse(null);
        }
        return ResponseEntity.ok(Map.of(
                "user", Map.of(
                        "id", user.getId(),
                        "phone", user.getPhone(),
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "fullName", user.getFullName() != null ? user.getFullName() : "",
                        "role", user.getRole(),
                        "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : ""
                ),
                "store", store != null ? Map.of(
                        "id", store.getId(),
                        "name", store.getName(),
                        "address", store.getAddress() != null ? store.getAddress() : "",
                        "whatsappNumber", store.getWhatsappNumber() != null ? store.getWhatsappNumber() : "",
                        "verificationStatus", store.getVerificationStatus(),
                        "freshnessScore", store.getFreshnessScore(),
                        "isOpen", store.getIsOpen(),
                        "logoUrl", store.getLogoUrl() != null ? store.getLogoUrl() : "",
                        "bannerUrl", store.getBannerUrl() != null ? store.getBannerUrl() : ""
                ) : Map.of()
        ));
    }

    @GetMapping("/orders/incoming")
    public ResponseEntity<?> getIncomingOrders() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(orderRepository.findByStoreIdAndStatus(storeId, "PENDING"));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody @jakarta.validation.Valid OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !order.getStore().getId().equals(currentStoreId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: Order does not belong to your store"));
        }
        String newStatus = request.getStatus().name();
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        if (savedOrder.getCustomer() != null) {
            notificationService.notifyCustomer(savedOrder.getCustomer().getId(), savedOrder);
        }

        return ResponseEntity.ok(Map.of("success", true, "newStatus", newStatus));
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProductToStore(@RequestBody StoreProductRequest request) {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: No associated store found for this admin"));
        }
        Inventory inventory = inventoryService.addProductToStore(
                storeId,
                request.getProduct(),
                request.getQuantity(),
                request.getBatchCode(),
                request.getExpiryTime()
        );
        return ResponseEntity.ok(inventory);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryQuantity(@PathVariable Long id, @RequestBody @jakarta.validation.Valid InventoryQuantityUpdateRequest request) {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Inventory inventory = inventoryService.updateQuantity(storeId, id, request.getQuantity());
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getStoreInventory() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<Inventory> inventoryList = inventoryService.getInventoryByStore(storeId);
        return ResponseEntity.ok(inventoryList);
    }

    @PostMapping("/inventory/analyze-shelf")
    public ResponseEntity<?> analyzeShelfPhoto(@RequestBody Map<String, String> body) {
        String objectKey = body.get("objectKey");
        if (objectKey == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "objectKey is required"));
        }
        return ResponseEntity.ok(visionService.analyzeShelfPhoto(objectKey));
    }

    @GetMapping("/weather-forecast")
    public ResponseEntity<?> getStoreWeatherForecast() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(weatherAnalyticsService.getForecastForStore(storeId));
    }

    @GetMapping("/products/{productId}/demand-adjustment")
    public ResponseEntity<?> getDemandAdjustment(@PathVariable Long productId) {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        com.quickcart.dto.response.WeatherSnapshot weather = weatherAnalyticsService.getForecastForStore(storeId);
        double adjustment = weatherAnalyticsService.adjustDemandForWeather(productId, weather);
        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "weather", weather,
                "demandMultiplier", adjustment
        ));
    }
}