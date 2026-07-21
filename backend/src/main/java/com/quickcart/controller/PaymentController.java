package com.quickcart.controller;

import com.quickcart.service.RazorpayService;
import com.quickcart.entity.Order;
import com.quickcart.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.razorpay.RazorpayException;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/payment")
@PreAuthorize("hasRole('CUSTOMER')")
public class PaymentController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> data) {
        try {
            Long orderId = Long.parseLong(data.get("orderId").toString());
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

            com.razorpay.Order razorpayOrder = razorpayService.createOrder(
                order.getTotalAmount(), 
                "Receipt_" + orderId
            );

            order.setRazorpayOrderId(razorpayOrder.get("id"));
            orderRepository.save(order);

            Map<String, String> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String razorpayOrderId = data.get("razorpayOrderId");
        String razorpayPaymentId = data.get("razorpayPaymentId");
        String signature = data.get("razorpaySignature");
        Long orderId = Long.parseLong(data.get("orderId"));

        boolean isValid = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (isValid) {
            order.setPaymentStatus("PAID");
            order.setRazorpayPaymentId(razorpayPaymentId);
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        } else {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            return ResponseEntity.badRequest().body(Map.of("status", "FAILED"));
        }
    }
}
