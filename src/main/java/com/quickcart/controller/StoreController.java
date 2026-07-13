package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.service.InventoryService;
import com.quickcart.dto.request.StoreProductRequest;
import com.quickcart.entity.Inventory;
import com.quickcart.entity.Order;
import com.quickcart.repository.OrderRepository;
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
    private NotificationService notificationService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @GetMapping("/orders/incoming")
    public ResponseEntity<?> getIncomingOrders() {
        return ResponseEntity.ok(Map.of("message", "Incoming orders"));
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        String newStatus = body.get("status");
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
    public ResponseEntity<?> updateInventoryQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity parameter is required"));
        }
        Inventory inventory = inventoryService.updateQuantity(id, quantity);
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
}
