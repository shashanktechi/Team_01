package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.dto.request.OrderStatusUpdateRequest;
import com.quickcart.dto.request.StoreProductRequest;
import com.quickcart.dto.request.InventoryQuantityUpdateRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Inventory;
import com.quickcart.entity.Store;
import com.quickcart.repository.OrderRepository;
import com.quickcart.service.InventoryService;
import com.quickcart.service.NotificationService;
import com.quickcart.service.VisionService;
import com.quickcart.service.WeatherAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/store")
@PreAuthorize("hasRole('STORE_ADMIN')")
public class StoreController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VisionService visionService;

    @Autowired
    private WeatherAnalyticsService weatherAnalyticsService;

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

    /**
     * Returns the store for the current user, throwing an exception if not found or not approved.
     * Used for mutating endpoints that require an approved store.
     */
    private Store getCurrentStoreForMutatingOperations() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No associated store found for this admin");
        }
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
        
        com.quickcart.config.CustomUserPrincipal principal = currentUserProvider.getCurrentUser();
        boolean isAdmin = principal != null && "SYSTEM_ADMIN".equals(principal.getRole());
        
        if (!isAdmin && !"APPROVED".equals(store.getVerificationStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Store is not approved. Please wait for admin approval.");
        }
        return store;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getStoreProfile() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        com.quickcart.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Store store = null;
        if (storeId != null) {
            store = storeRepository.findById(storeId).orElse(null);
        }
        if (store == null && "STORE_ADMIN".equals(user.getRole())) {
            java.util.List<Store> ownerStores = storeRepository.findByOwnerId(userId);
            store = ownerStores.isEmpty() ? null : ownerStores.get(0);
        }

        return ResponseEntity.ok(Map.of(
                "user", Map.of(
                        "id", user.getId(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "fullName", user.getFullName() != null ? user.getFullName() : "",
                        "role", user.getRole(),
                        "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : ""
                ),
                "store", store != null ? Map.of(
                        "id", store.getId(),
                        "name", store.getName() != null ? store.getName() : "",
                        "address", store.getAddress() != null ? store.getAddress() : "",
                        "whatsappNumber", store.getWhatsappNumber() != null ? store.getWhatsappNumber() : "",
                        "verificationStatus", store.getVerificationStatus() != null ? store.getVerificationStatus() : "",
                        "freshnessScore", store.getFreshnessScore() != null ? store.getFreshnessScore() : 0.0,
                        "isOpen", store.getIsOpen() != null ? store.getIsOpen() : false,
                        "logoUrl", store.getLogoUrl() != null ? store.getLogoUrl() : "",
                        "bannerUrl", store.getBannerUrl() != null ? store.getBannerUrl() : ""
                ) : Map.of()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateStoreProfile(@RequestBody Map<String, Object> request) {
        Store store = getCurrentStoreForMutatingOperations();
        if (request.containsKey("name") && request.get("name") != null) store.setName((String) request.get("name"));
        if (request.containsKey("address")) store.setAddress((String) request.get("address"));
        if (request.containsKey("city") && request.get("city") != null) store.setCity((String) request.get("city"));
        if (request.containsKey("whatsappNumber")) store.setWhatsappNumber((String) request.get("whatsappNumber"));
        if (request.containsKey("isOpen")) store.setIsOpen((Boolean) request.get("isOpen"));
        
        storeRepository.save(store);

        Long userId = currentUserProvider.getCurrentUserId();
        if (userId != null) {
            com.quickcart.entity.User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                if (request.containsKey("userFullName") && request.get("userFullName") != null) {
                    user.setFullName((String) request.get("userFullName"));
                }
                if (request.containsKey("userPhone") && request.get("userPhone") != null) {
                    user.setPhone((String) request.get("userPhone"));
                }
                userRepository.save(user);
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        Long storeId = currentUserProvider.getCurrentStoreId();
        if (storeId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(orderRepository.findByStoreId(storeId));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody @jakarta.validation.Valid OrderStatusUpdateRequest request) {
        // Check store approval for mutating operation
        getCurrentStoreForMutatingOperations();

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
        // Check store approval for mutating operation
        Store store = getCurrentStoreForMutatingOperations();
        Long storeId = store.getId();

        java.time.LocalDateTime expiryTime = null;
        if (request.getExpiryTime() != null && !request.getExpiryTime().trim().isEmpty()) {
            try {
                // Handle "2024-01-15T10:30" (no seconds) and full ISO format
                String expiryStr = request.getExpiryTime().trim();
                if (expiryStr.length() == 16) {
                    expiryStr = expiryStr + ":00"; // append seconds
                }
                expiryTime = java.time.LocalDateTime.parse(expiryStr);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid expiry time format. Use YYYY-MM-DDTHH:mm"));
            }
        }

        Inventory inventory = inventoryService.addProductToStore(
                storeId,
                request.getProduct(),
                request.getQuantity(),
                request.getBatchCode(),
                expiryTime
        );
        return ResponseEntity.ok(inventory);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryQuantity(@PathVariable Long id, @RequestBody @jakarta.validation.Valid InventoryQuantityUpdateRequest request) {
        // Check store approval for mutating operation
        Store store = getCurrentStoreForMutatingOperations();
        Long storeId = store.getId();

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
        // Check store approval for mutating operation
        getCurrentStoreForMutatingOperations();

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
