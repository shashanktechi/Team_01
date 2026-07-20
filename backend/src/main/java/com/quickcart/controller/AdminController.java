package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.dto.request.StoreVerificationRequest;
import com.quickcart.entity.AuditLog;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.AuditLogRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AdminController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/stores")
    public ResponseEntity<?> getAllStores() {
        return ResponseEntity.ok(storeRepository.findAll());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody java.util.Map<String, Boolean> request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Boolean active = request.get("active");
        if (active != null) {
            user.setIsActive(active);
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/stores/pending")
    public ResponseEntity<?> getPendingStores() {
        return ResponseEntity.ok(storeRepository.findByVerificationStatus("PENDING"));
    }

    @PutMapping("/stores/{id}/verify")
    public ResponseEntity<?> verifyStore(@PathVariable Long id,
                                         @RequestBody @jakarta.validation.Valid StoreVerificationRequest request,
                                         HttpServletRequest servletRequest) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        String statusStr = request.getStatus().name();
        store.setVerificationStatus(statusStr);
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
                log.setMetadata("{\"status\":\"" + statusStr + "\"}");
                String ipAddress = servletRequest.getHeader("X-FORWARDED-FOR");
                if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                    ipAddress = servletRequest.getRemoteAddr();
                }
                log.setIpAddress(ipAddress);
                auditLogRepository.save(log);
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/delivery-partners/pending")
    public ResponseEntity<?> getPendingDeliveryPartners() {
        return ResponseEntity.ok(userRepository.findByRoleAndVerificationStatus("DELIVERY_PARTNER", "PENDING"));
    }

    @PutMapping("/delivery-partners/{id}/verify")
    public ResponseEntity<?> verifyDeliveryPartner(@PathVariable Long id,
                                                   @RequestBody java.util.Map<String, String> request,
                                                   HttpServletRequest servletRequest) {
        User partner = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        if (!"DELIVERY_PARTNER".equals(partner.getRole())) {
            throw new RuntimeException("User is not a delivery partner");
        }

        String statusStr = request.get("status");
        if (statusStr == null || (!statusStr.equals("APPROVED") && !statusStr.equals("REJECTED"))) {
            throw new RuntimeException("Invalid status. Must be APPROVED or REJECTED.");
        }

        partner.setVerificationStatus(statusStr);
        if ("APPROVED".equals(statusStr)) {
            partner.setIsActive(true);
        } else {
            partner.setIsActive(false);
        }
        userRepository.save(partner);

        // Record to Audit Logs
        Long adminId = currentUserProvider.getCurrentUserId();
        if (adminId != null) {
            User admin = userRepository.findById(adminId).orElse(null);
            if (admin != null) {
                AuditLog log = new AuditLog();
                log.setAdmin(admin);
                log.setAction("VERIFY_DELIVERY_PARTNER");
                log.setMetadata("{\"deliveryPartnerId\":" + id + ",\"status\":\"" + statusStr + "\"}");
                String ipAddress = servletRequest.getHeader("X-FORWARDED-FOR");
                if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                    ipAddress = servletRequest.getRemoteAddr();
                }
                log.setIpAddress(ipAddress);
                auditLogRepository.save(log);
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }
}
