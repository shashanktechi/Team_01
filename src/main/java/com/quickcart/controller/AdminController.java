package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.AuditLogRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.entity.Store;
import com.quickcart.entity.AuditLog;
import com.quickcart.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
@SuppressWarnings("null")
public class AdminController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @GetMapping("/stores/pending")
    public ResponseEntity<?> getPendingStores() {
        List<Store> pendingStores = storeRepository.findByVerificationStatus("PENDING");
        return ResponseEntity.ok(pendingStores);
    }

    @PutMapping("/stores/{id}/verify")
    public ResponseEntity<?> verifyStore(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status parameter is required"));
        }
        
        store.setVerificationStatus(status);
        storeRepository.save(store);

        // Record to Audit Logs
        Long adminId = currentUserProvider.getCurrentUserId();
        if (adminId != null) {
            User admin = userRepository.findById(adminId).orElse(null);
            if (admin != null) {
                AuditLog log = new AuditLog();
                log.setAdmin(admin);
                log.setAction("VERIFY_STORE");
                log.setTargetStoreId(id);
                log.setMetadata("{\"status\":\"" + status + "\"}");
                log.setIpAddress("127.0.0.1"); // simple fallback IP
                auditLogRepository.save(log);
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }
}
