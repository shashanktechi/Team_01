package com.quickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
public class DeliveryController {

    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(Map.of("updated", true));
    }
}
