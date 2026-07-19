package com.quickcart.controller;

import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.request.ForgotPasswordRequest;
import com.quickcart.dto.request.RegisterRequest;
import com.quickcart.dto.request.ResetPasswordRequest;
import com.quickcart.dto.request.VerifyResetOtpRequest;
import com.quickcart.dto.response.AuthResponse;
import com.quickcart.dto.response.ResetTokenResponse;
import com.quickcart.service.AuthService;
import com.quickcart.config.CurrentUserProvider;
import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser() {
        Long userId = currentUserProvider.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "verificationStatus", user.getVerificationStatus(),
                "profilePhotoUrl", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : ""
        ));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody AuthRequest request) {
        String target = request.getEmail() != null && !request.getEmail().trim().isEmpty() 
                ? request.getEmail() : request.getPhone();
        authService.sendOtp(target);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @jakarta.validation.Valid AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @jakarta.validation.Valid RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "A password reset code has been sent to your email."));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ResetTokenResponse> verifyResetOtp(@RequestBody VerifyResetOtpRequest request) {
        String resetToken = authService.verifyResetOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(new ResetTokenResponse("OTP verified", resetToken));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getResetToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now log in."));
    }
}