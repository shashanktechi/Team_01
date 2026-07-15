package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.dto.request.ConfirmMediaRequest;
import com.quickcart.dto.request.UploadUrlRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Product;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.service.S3Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @PostMapping("/profile-photo/upload-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfilePhotoUploadUrl(@RequestBody @Valid UploadUrlRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String objectKey = "users/" + userId + "/profile.jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/profile-photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> confirmProfilePhoto(@RequestBody @Valid ConfirmMediaRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String expectedKey = "users/" + userId + "/profile.jpg";
        if (!expectedKey.equals(request.getObjectKey())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }

        user.setProfilePhotoUrl(s3Service.getPublicUrl(request.getObjectKey()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "url", user.getProfilePhotoUrl()));
    }

    @PostMapping("/store/{storeId}/logo/upload-url")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> getStoreLogoUploadUrl(@PathVariable Long storeId, @RequestBody @Valid UploadUrlRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String objectKey = "stores/" + storeId + "/logo.jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/store/{storeId}/logo")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmStoreLogo(@PathVariable Long storeId, @RequestBody @Valid ConfirmMediaRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String expectedKey = "stores/" + storeId + "/logo.jpg";
        if (!expectedKey.equals(request.getObjectKey())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }
        Store store = storeRepository.findById(Objects.requireNonNull(storeId))
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setLogoUrl(s3Service.getPublicUrl(request.getObjectKey()));
        storeRepository.save(store);
        return ResponseEntity.ok(Map.of("success", true, "url", store.getLogoUrl()));
    }

    @PostMapping("/store/{storeId}/banner/upload-url")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> getStoreBannerUploadUrl(@PathVariable Long storeId, @RequestBody @Valid UploadUrlRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String objectKey = "stores/" + storeId + "/banner.jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/store/{storeId}/banner")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmStoreBanner(@PathVariable Long storeId, @RequestBody @Valid ConfirmMediaRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String expectedKey = "stores/" + storeId + "/banner.jpg";
        if (!expectedKey.equals(request.getObjectKey())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }
        Store store = storeRepository.findById(Objects.requireNonNull(storeId))
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setBannerUrl(s3Service.getPublicUrl(request.getObjectKey()));
        storeRepository.save(store);
        return ResponseEntity.ok(Map.of("success", true, "url", store.getBannerUrl()));
    }

    @PostMapping("/store/{storeId}/products/{productId}/upload-url")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> getProductPhotoUploadUrl(@PathVariable Long storeId, @PathVariable Long productId, @RequestBody @Valid UploadUrlRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String uuid = UUID.randomUUID().toString();
        String objectKey = "stores/" + storeId + "/products/" + productId + "/" + uuid + ".jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/store/{storeId}/products/{productId}")
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<?> confirmProductPhoto(@PathVariable Long storeId, @PathVariable Long productId, @RequestBody @Valid ConfirmMediaRequest request) {
        Long currentStoreId = currentUserProvider.getCurrentStoreId();
        if (currentStoreId == null || !currentStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not manage this store"));
        }
        String prefix = "stores/" + storeId + "/products/" + productId + "/";
        if (!request.getObjectKey().startsWith(prefix) || !request.getObjectKey().endsWith(".jpg")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }
        Product product = productRepository.findById(Objects.requireNonNull(productId))
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setImageUrl(s3Service.getPublicUrl(request.getObjectKey()));
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("success", true, "url", product.getImageUrl()));
    }

    @PostMapping("/delivery/vehicle-doc/upload-url")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> getVehicleDocUploadUrl(@RequestBody @Valid UploadUrlRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String objectKey = "delivery-partners/" + userId + "/vehicle-doc.jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/delivery/vehicle-doc")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> confirmVehicleDoc(@RequestBody @Valid ConfirmMediaRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        String expectedKey = "delivery-partners/" + userId + "/vehicle-doc.jpg";
        if (!expectedKey.equals(request.getObjectKey())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVehicleDocUrl(s3Service.getPublicUrl(request.getObjectKey()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "url", user.getVehicleDocUrl()));
    }

    @PostMapping("/orders/{orderId}/proof-of-delivery/upload-url")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> getProofOfDeliveryUploadUrl(@PathVariable Long orderId, @RequestBody @Valid UploadUrlRequest request) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You are not assigned to this order"));
        }
        String objectKey = "orders/" + orderId + "/proof-of-delivery.jpg";
        String uploadUrl = s3Service.generateUploadUrl(objectKey, request.getContentType());
        String publicUrl = s3Service.getPublicUrl(objectKey);
        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl,
                "objectKey", objectKey,
                "publicUrl", publicUrl
        ));
    }

    @PatchMapping("/orders/{orderId}/proof-of-delivery")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<?> confirmProofOfDelivery(@PathVariable Long orderId, @RequestBody @Valid ConfirmMediaRequest request) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You are not assigned to this order"));
        }
        String expectedKey = "orders/" + orderId + "/proof-of-delivery.jpg";
        if (!expectedKey.equals(request.getObjectKey())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: objectKey mismatch"));
        }
        order.setProofOfDeliveryUrl(s3Service.getPublicUrl(request.getObjectKey()));
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "url", order.getProofOfDeliveryUrl()));
    }
}
