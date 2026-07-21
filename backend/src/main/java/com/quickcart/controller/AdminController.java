package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
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
    private com.quickcart.repository.OrderRepository orderRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private com.quickcart.service.EmailService emailService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/stores")
    public ResponseEntity<?> getAllStores() {
        return ResponseEntity.ok(storeRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        long activeOrders = orderRepository.countActiveOrders();
        long approvedStoreCount = storeRepository.countByVerificationStatus("APPROVED");
        java.math.BigDecimal grossTransactionValue = orderRepository.sumGrossTransactionValue();
        if (grossTransactionValue == null) {
            grossTransactionValue = java.math.BigDecimal.ZERO;
        }
        return ResponseEntity.ok(Map.of(
            "activeOrders", activeOrders,
            "approvedStoreCount", approvedStoreCount,
            "grossTransactionValue", grossTransactionValue
        ));
    }

    @GetMapping("/stats/revenue-trend")
    public ResponseEntity<?> getRevenueTrend(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(orderRepository.findRevenueTrend(days));
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
                                         @RequestBody Map<String, String> body,
                                         HttpServletRequest servletRequest) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        String statusStr = status.trim().toUpperCase();
        if (!statusStr.equals("APPROVED") && !statusStr.equals("REJECTED") && !statusStr.equals("PENDING")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Must be APPROVED, REJECTED, or PENDING."));
        }
        store.setVerificationStatus(statusStr);
        storeRepository.save(store);

        // Also update the store owner's verification status so they can log in
        User owner = store.getOwner();
        if (owner != null) {
            owner.setVerificationStatus(statusStr);
            if ("APPROVED".equals(statusStr)) {
                owner.setIsActive(true);
            } else if ("REJECTED".equals(statusStr)) {
                owner.setIsActive(false);
                String reason = body.get("reason");
                try {
                    emailService.sendVerificationRejectionEmail(
                        owner.getEmail(),
                        "Store Admin",
                        reason
                    );
                } catch (Exception e) {
                    // Log but don't fail transaction
                }
            }
            userRepository.save(owner);
        }

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
                                                   @RequestBody Map<String, String> body,
                                                   HttpServletRequest servletRequest) {
        User partner = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        if (!"DELIVERY_PARTNER".equals(partner.getRole())) {
            throw new RuntimeException("User is not a delivery partner");
        }

        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        String statusStr = status.trim().toUpperCase();
        if (!statusStr.equals("APPROVED") && !statusStr.equals("REJECTED")) {
            throw new RuntimeException("Invalid status. Must be APPROVED or REJECTED.");
        }

        partner.setVerificationStatus(statusStr);
        if ("APPROVED".equals(statusStr)) {
            partner.setIsActive(true);
        } else {
            partner.setIsActive(false);
            if ("REJECTED".equals(statusStr)) {
                String reason = body.get("reason");
                try {
                    emailService.sendVerificationRejectionEmail(
                        partner.getEmail(),
                        "Delivery Partner",
                        reason
                    );
                } catch (Exception e) {
                    // Log but don't fail transaction
                }
            }
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

    @DeleteMapping("/dev/reset-stores")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> resetAllStores() {
        org.springframework.jdbc.core.JdbcTemplate jdbcTemplate = org.springframework.web.context.support.WebApplicationContextUtils
                .getRequiredWebApplicationContext(((org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest().getServletContext())
                .getBean(org.springframework.jdbc.core.JdbcTemplate.class);
        
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE inventory CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE order_items CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE orders CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE products CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE stores CASCADE");
        jdbcTemplate.execute("DELETE FROM users WHERE role = 'STORE_ADMIN'");
        
        return ResponseEntity.ok(Map.of("message", "All stores and related data wiped completely via TRUNCATE."));
    }
}
