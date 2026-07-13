package com.quickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AdminController {

    @GetMapping("/stores/pending")
    public ResponseEntity<?> getPendingStores() {
        return ResponseEntity.ok(List.of());
    }

    @PutMapping("/stores/{id}/verify")
    public ResponseEntity<?> verifyStore(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true));
    }
}
