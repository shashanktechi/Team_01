package com.quickcart.controller;

import com.quickcart.dto.request.OrderRequest;
import com.quickcart.entity.Order;
import com.quickcart.service.OrderRoutingService;
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

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody @org.springframework.lang.NonNull OrderRequest request) {
        // Assuming we extract userId from token in JwtAuthenticationFilter or Auth service, for simplicity here:
        // Long userId = jwtTokenProvider.getUserIdFromJwtToken(...); 
        // Using a dummy user id 1 for testing:
        Long customerId = 1L; 
        
        try {
            Order order = orderRoutingService.routeOrder(customerId, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
