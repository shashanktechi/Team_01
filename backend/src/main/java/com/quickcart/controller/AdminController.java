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

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

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

    @PutMapping("/delivery-partners/{id}/verify-document")
    public ResponseEntity<?> verifyDeliveryPartnerDocument(@PathVariable Long id,
                                                           @RequestBody Map<String, Object> body) {
        User partner = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        if (!"DELIVERY_PARTNER".equals(partner.getRole())) {
            throw new RuntimeException("User is not a delivery partner");
        }

        String docType = (String) body.get("docType");
        Boolean verified = (Boolean) body.get("verified");
        if (docType == null || verified == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "docType and verified are required"));
        }

        switch (docType) {
            case "ssc": partner.setSscVerified(verified); break;
            case "inter": partner.setInterVerified(verified); break;
            case "driverLicense": partner.setDriverLicenseVerified(verified); break;
            case "bikeRc": partner.setBikeRcVerified(verified); break;
            case "otherCert": partner.setOtherCertVerified(verified); break;
            case "aadhar": partner.setAadharVerified(verified); break;
            default: return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type"));
        }

        userRepository.save(partner);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document verified status updated"));
    }

    @PostMapping("/delivery-partners/{id}/send-kyc-email")
    public ResponseEntity<?> sendKycEmail(@PathVariable Long id) {
        User partner = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        if (!"DELIVERY_PARTNER".equals(partner.getRole())) {
            throw new RuntimeException("User is not a delivery partner");
        }

        boolean allVerified = Boolean.TRUE.equals(partner.getSscVerified()) &&
                              Boolean.TRUE.equals(partner.getInterVerified()) &&
                              Boolean.TRUE.equals(partner.getDriverLicenseVerified()) &&
                              Boolean.TRUE.equals(partner.getBikeRcVerified()) &&
                              Boolean.TRUE.equals(partner.getOtherCertVerified()) &&
                              Boolean.TRUE.equals(partner.getAadharVerified());

        if (allVerified) {
            partner.setVerificationStatus("APPROVED");
            partner.setIsActive(true);
            userRepository.save(partner);
            emailService.sendKycStatusEmail(partner.getEmail(), true, java.util.Collections.<String>emptyList());
        } else {
            partner.setVerificationStatus("REJECTED");
            partner.setIsActive(false);
            userRepository.save(partner);
            
            java.util.List<String> unverified = new java.util.ArrayList<>();
            if (!Boolean.TRUE.equals(partner.getSscVerified())) unverified.add("SSC Certificate");
            if (!Boolean.TRUE.equals(partner.getInterVerified())) unverified.add("Inter Certificate");
            if (!Boolean.TRUE.equals(partner.getDriverLicenseVerified())) unverified.add("Driver License");
            if (!Boolean.TRUE.equals(partner.getBikeRcVerified())) unverified.add("Bike RC");
            if (!Boolean.TRUE.equals(partner.getOtherCertVerified())) unverified.add("Other Certificate");
            if (!Boolean.TRUE.equals(partner.getAadharVerified())) unverified.add("Aadhar Card");

            emailService.sendKycStatusEmail(partner.getEmail(), false, unverified);
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "KYC email sent", "isApproved", allVerified));
    }

    @Autowired
    private com.quickcart.repository.CategoryTaxRepository categoryTaxRepository;

    @GetMapping("/category-taxes")
    public ResponseEntity<?> getCategoryTaxes() {
        try {
            return ResponseEntity.ok(categoryTaxRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @PutMapping("/category-taxes")
    public ResponseEntity<?> updateCategoryTaxes(@RequestBody java.util.List<java.util.Map<String, Object>> taxes) {
        try {
            // Ensure table exists safely
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS category_taxes (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "category_name VARCHAR(100) UNIQUE NOT NULL, " +
                "tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            );

            for (java.util.Map<String, Object> taxMap : taxes) {
                Object nameObj = taxMap.get("categoryName");
                Object rateObj = taxMap.get("taxPercentage");
                if (nameObj != null) {
                    String catName = nameObj.toString();
                    java.math.BigDecimal rate = java.math.BigDecimal.ZERO;
                    if (rateObj != null) {
                        try {
                            rate = new java.math.BigDecimal(rateObj.toString());
                        } catch (Exception ignored) {}
                    }

                    com.quickcart.entity.CategoryTax existing = categoryTaxRepository
                            .findByCategoryNameIgnoreCase(catName)
                            .orElseGet(() -> {
                                com.quickcart.entity.CategoryTax newTax = new com.quickcart.entity.CategoryTax();
                                newTax.setCategoryName(catName);
                                return newTax;
                            });
                    existing.setTaxPercentage(rate);
                    categoryTaxRepository.save(existing);
                }
            }
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Category taxes updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}

