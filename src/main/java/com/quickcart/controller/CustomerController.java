package com.quickcart.controller;

import com.quickcart.dto.request.OrderRequest;
import com.quickcart.entity.Order;
import com.quickcart.service.OrderRoutingService;
import com.quickcart.config.CurrentUserProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private OrderRoutingService orderRoutingService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

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
}
