package com.quickcart.controller;

import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.response.AuthResponse;
import com.quickcart.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody @jakarta.validation.Valid AuthRequest request) {
        authService.sendOtp(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent to WhatsApp"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @jakarta.validation.Valid AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
