package com.quickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/store")
@PreAuthorize("hasRole('STORE_ADMIN')")
public class StoreController {

    @GetMapping("/orders/incoming")
    public ResponseEntity<?> getIncomingOrders() {
        return ResponseEntity.ok(Map.of("message", "Incoming orders"));
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "newStatus", body.get("status")));
    }
}
