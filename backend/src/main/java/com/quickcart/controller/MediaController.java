package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.entity.Order;
import com.quickcart.entity.Product;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.quickcart.repository.InventoryRepository inventoryRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    private String getExtensionAndValidate(String contentType) {
        if (contentType == null) {
            return null;
        }
        switch (contentType.toLowerCase()) {
            case "image/jpeg":
            case "image/jpg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/webp":
                return ".webp";
            default:
                return null;
        }
    }

    @PatchMapping("/profile-photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> confirmProfilePhoto(@RequestParam("file") MultipartFile file) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type. Only JPEG, PNG, and WebP are allowed."));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            String url = cloudinaryService.uploadFile(file, "users/" + userId);
            user.setProfilePhotoUrl(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/kyc-documents")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> uploadKycDocument(@RequestParam("docType") String docType, @RequestParam("file") MultipartFile file) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null && !file.getContentType().equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type. Allowed: JPEG, PNG, WebP, PDF."));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            String url = cloudinaryService.uploadFile(file, "users/" + userId + "/kyc");
            switch (docType) {
                case "ssc": user.setSscCertUrl(url); break;
                case "inter": user.setInterCertUrl(url); break;
                case "driverLicense": user.setDriverLicenseUrl(url); break;
                case "bikeRc": user.setBikeRcUrl(url); break;
                case "otherCert": user.setOtherCertUrl(url); break;
                case "aadhar": user.setAadharUrl(url); break;
                default: return ResponseEntity.badRequest().body(Map.of("error", "Invalid docType"));
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "url", url, "docType", docType));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/store/{storeId}/logo")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmStoreLogo(@PathVariable Long storeId, @RequestParam("file") MultipartFile file) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type."));
        }
        Store store = storeRepository.findById(Objects.requireNonNull(storeId))
                .orElseThrow(() -> new RuntimeException("Store not found"));
        try {
            String url = cloudinaryService.uploadFile(file, "stores/" + storeId + "/logo");
            store.setLogoUrl(url);
            storeRepository.save(store);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/store/{storeId}/banner")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmStoreBanner(@PathVariable Long storeId, @RequestParam("file") MultipartFile file) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type."));
        }
        Store store = storeRepository.findById(Objects.requireNonNull(storeId))
                .orElseThrow(() -> new RuntimeException("Store not found"));
        try {
            String url = cloudinaryService.uploadFile(file, "stores/" + storeId + "/banner");
            store.setBannerUrl(url);
            storeRepository.save(store);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/store/{storeId}/products/{productId}")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmProductPhoto(@PathVariable Long storeId, @PathVariable Long productId, @RequestParam("file") MultipartFile file) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type."));
        }
        Product product = productRepository.findById(Objects.requireNonNull(productId))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!inventoryRepository.existsByStoreIdAndProductId(storeId, productId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "This product is not in your store's inventory."));
        }

        try {
            String url = cloudinaryService.uploadFile(file, "stores/" + storeId + "/products/" + productId);
            product.setImageUrl(url);
            productRepository.save(product);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/delivery/vehicle-doc")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> confirmVehicleDoc(@RequestParam("file") MultipartFile file) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type."));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            String url = cloudinaryService.uploadFile(file, "delivery-partners/" + userId);
            user.setVehicleDocUrl(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }

    @PatchMapping("/orders/{orderId}/proof-of-delivery")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> confirmProofOfDelivery(@PathVariable Long orderId, @RequestParam("file") MultipartFile file) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You are not assigned to this order"));
        }
        String ext = getExtensionAndValidate(file.getContentType());
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid content type."));
        }
        try {
            String url = cloudinaryService.uploadFile(file, "orders/" + orderId);
            order.setProofOfDeliveryUrl(url);
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file"));
        }
    }
}
