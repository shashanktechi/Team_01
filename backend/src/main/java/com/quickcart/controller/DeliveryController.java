package com.quickcart.controller;

import com.quickcart.config.CurrentUserProvider;
import com.quickcart.dto.request.LocationRequest;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.SwarmRepository;
import com.quickcart.entity.Order;
import com.quickcart.entity.Swarm;
import com.quickcart.entity.User;
import com.quickcart.service.NotificationService;
import com.quickcart.service.SwarmBatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
@SuppressWarnings("null")
public class DeliveryController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SwarmRepository swarmRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SwarmBatchingService swarmBatchingService;

    @Autowired
    private com.quickcart.repository.UserRepository userRepository;

    /**
     * Returns the current delivery partner user, throwing an exception if not found or not approved.
     */
    private User getCurrentDeliveryPartner() {
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (partnerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No delivery partner found");
        }
        User user = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery partner not found"));
        if (!"APPROVED".equals(user.getVerificationStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Delivery partner is not approved. Please wait for admin approval.");
        }
        return user;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getDeliveryProfile() {
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (partnerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        com.quickcart.entity.User user = userRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "phone", user.getPhone(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole(),
                "trustScore", user.getTrustScore(),
                "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : "",
                "vehicleDocUrl", user.getVehicleDocUrl() != null ? user.getVehicleDocUrl() : ""
        ));
    }

    @GetMapping("/tasks")
    public ResponseEntity<?> getAssignedTasks() {
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (partnerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<Swarm> swarms = swarmRepository.findByDeliveryPartnerId(partnerId);
        List<Order> orders = orderRepository.findByDeliveryPartnerId(partnerId);

        return ResponseEntity.ok(Map.of(
            "swarms", swarms,
            "orders", orders
        ));
    }

    @PatchMapping("/status")
    public ResponseEntity<?> updateOrderStatus(@RequestBody @jakarta.validation.Valid com.quickcart.dto.request.OrderStatusUpdateRequest request) {
        // Check delivery partner approval for mutating operation
        getCurrentDeliveryPartner();

        Long orderId = request.getOrderId();
        if (orderId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderId is required"));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Ensure this delivery partner is indeed assigned to the order
        Long partnerId = currentUserProvider.getCurrentUserId();
        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: You are not assigned to this order"));
        }

        String statusStr = request.getStatus().name();
        order.setStatus(statusStr);
        Order savedOrder = orderRepository.save(order);

        if (savedOrder.getCustomer() != null) {
            notificationService.notifyCustomer(savedOrder.getCustomer().getId(), savedOrder);
        }

        return ResponseEntity.ok(Map.of(
            "updated", true,
            "orderId", orderId,
            "newStatus", statusStr
        ));
    }

    @PostMapping("/batch")
    public ResponseEntity<?> claimBatch(@RequestBody @jakarta.validation.Valid LocationRequest body) {
        // Check delivery partner approval for mutating operation
        getCurrentDeliveryPartner();

        Long partnerId = currentUserProvider.getCurrentUserId();
        if (partnerId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Swarm swarm = swarmBatchingService.batchOrdersForDelivery(partnerId, body.getLat(), body.getLng());
        return swarm != null ? ResponseEntity.ok(swarm) : ResponseEntity.noContent().build();
    }
}