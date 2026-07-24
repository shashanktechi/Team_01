package com.quickcart.controller;

import com.quickcart.dto.request.OrderRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.entity.Inventory;
import com.quickcart.service.OrderRoutingService;
import com.quickcart.service.InventoryService;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.config.CurrentUserProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private OrderRoutingService orderRoutingService;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private com.quickcart.service.AiProviderRouter aiProviderRouter;

    private final java.util.concurrent.ConcurrentHashMap<Long, Long> userAssistantCooldown = new java.util.concurrent.ConcurrentHashMap<>();

    @GetMapping("/stores/nearby")
    public ResponseEntity<?> getNearbyStores(@RequestParam double lat, @RequestParam double lng,
                                              @RequestParam(defaultValue = "20") int limit) {
        List<Store> stores = storeRepository.findNearestStores(lat, lng, limit);
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/stores/{storeId}/inventory")
    public ResponseEntity<?> getStoreInventory(@PathVariable Long storeId) {
        List<Inventory> inventoryList = inventoryService.getInventoryByStore(storeId);
        return ResponseEntity.ok(inventoryList);
    }

    @GetMapping("/stores/{storeId}")
    public ResponseEntity<?> getStoreDetails(@PathVariable Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        return ResponseEntity.ok(store);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrderHistory() {
        Long customerId = currentUserProvider.getCurrentUserId();
        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        Long customerId = currentUserProvider.getCurrentUserId();
        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Order order = orderRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCustomer().getId().equals(customerId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: You do not own this order"));
        }
        return ResponseEntity.ok(order);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Long customerId = currentUserProvider.getCurrentUserId();
        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        java.util.Map<String, Object> responseMap = new java.util.HashMap<>(Map.of(
                "id", user.getId(),
                "phone", user.getPhone(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole(),
                "trustScore", user.getTrustScore(),
                "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : "",
                "vehicleDocUrl", user.getVehicleDocUrl() != null ? user.getVehicleDocUrl() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
        ));
        
        responseMap.put("verificationStatus", user.getVerificationStatus());
        responseMap.put("sscCertUrl", user.getSscCertUrl());
        responseMap.put("sscVerified", user.getSscVerified());
        responseMap.put("interCertUrl", user.getInterCertUrl());
        responseMap.put("interVerified", user.getInterVerified());
        responseMap.put("driverLicenseUrl", user.getDriverLicenseUrl());
        responseMap.put("driverLicenseVerified", user.getDriverLicenseVerified());
        responseMap.put("bikeRcUrl", user.getBikeRcUrl());
        responseMap.put("bikeRcVerified", user.getBikeRcVerified());
        responseMap.put("otherCertUrl", user.getOtherCertUrl());
        responseMap.put("otherCertVerified", user.getOtherCertVerified());
        responseMap.put("aadharUrl", user.getAadharUrl());
        responseMap.put("aadharVerified", user.getAadharVerified());
        
        return ResponseEntity.ok(responseMap);
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody @org.springframework.lang.NonNull @jakarta.validation.Valid OrderRequest request) {
        Long customerId = currentUserProvider.getCurrentUserId();
        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        } 
        
        try {
            Order order = orderRoutingService.routeOrder(customerId, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assistant/ask")
    public ResponseEntity<?> askAssistant(@RequestBody Map<String, String> body) {
        Long customerId = currentUserProvider.getCurrentUserId();
        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        long now = System.currentTimeMillis();
        Long lastRequestTime = userAssistantCooldown.get(customerId);
        if (lastRequestTime != null && (now - lastRequestTime) < 3000) {
            return ResponseEntity.status(429).body(Map.of("error", "Please wait a moment before sending another message."));
        }
        userAssistantCooldown.put(customerId, now);

        String message = body.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        String prompt = "You are a helpful assistant for a hyperlocal grocery app called QuickCart. Answer briefly. User: " + message.trim();
        String reply = aiProviderRouter.queryAi(prompt);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
