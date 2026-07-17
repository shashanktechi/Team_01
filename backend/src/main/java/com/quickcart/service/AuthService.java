package com.quickcart.service;

import com.quickcart.config.JwtTokenProvider;
import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.request.RegisterRequest;
import com.quickcart.dto.response.AuthResponse;
import com.quickcart.entity.OtpRequest;
import com.quickcart.entity.PasswordResetToken;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.OtpRequestRepository;
import com.quickcart.repository.PasswordResetTokenRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private OtpRequestRepository otpRequestRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // OTP validity in minutes
    private static final long OTP_VALIDITY_MINUTES = 10;
    // Max OTP send attempts per email per window
    private static final int MAX_OTP_SEND_PER_WINDOW = 5;
    // Window for OTP send rate limiting in minutes
    private static final int OTP_SEND_WINDOW_MINUTES = 15;
    // Max OTP verification attempts
    private static final int MAX_OTP_ATTEMPTS = 5;
    // Password reset token validity in minutes
    private static final long RESET_TOKEN_VALIDITY_MINUTES = 10;

    /**
     * Sends an OTP to the given email address.
     * Implements rate limiting: max 5 sends per email per 15 minutes.
     */
    public void sendOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String emailClean = email.trim().toLowerCase();
        String otp = generateAndSaveOtp(emailClean);
        log.info("==== GENERATED OTP FOR {}: {} ====", emailClean, otp);

        try {
            emailService.sendOtpEmail(emailClean, otp);
            log.info("OTP sent to {}", emailClean);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", emailClean, e.getMessage());
            throw new RuntimeException("Failed to send verification code. Please try again later.");
        }
    }

    /**
     * Generates a 6-digit OTP for the given (already-lowercased/trimmed) email,
     * enforces the send rate limit, and persists it to otp_requests.
     * Returns the raw (unhashed) OTP so the caller can email it out.
     * Shared by sendOtp() (register/login) and forgotPassword() (password reset) —
     * both flows use the same otp_requests table and validity/attempt rules.
     */
    private String generateAndSaveOtp(String emailClean) {
        long countSent = otpRequestRepository.countByEmailAndCreatedAtAfter(
                emailClean,
                Instant.now().minus(OTP_SEND_WINDOW_MINUTES, ChronoUnit.MINUTES)
        );
        if (countSent >= MAX_OTP_SEND_PER_WINDOW) {
            throw new RuntimeException("OTP send limit exceeded. Please try again later.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        String otpHash = passwordEncoder.encode(otp);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES);

        otpRequestRepository.deleteByEmail(emailClean);
        otpRequestRepository.flush();

        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setEmail(emailClean);
        otpRequest.setOtpHash(otpHash);
        otpRequest.setExpiresAt(expiresAt);
        otpRequest.setCreatedAt(now);
        otpRequest.setAttemptCount(0);
        otpRequest.setVerified(false);
        otpRequestRepository.save(otpRequest);

        return otp;
    }

    /**
     * FORGOT PASSWORD — STEP 1
     * Sends a password-reset OTP to the given email. Reuses the same
     * otp_requests table/rate-limit as login & registration OTPs, but with
     * reset-specific email copy.
     */
    public void forgotPassword(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String emailClean = email.trim().toLowerCase();

        userRepository.findByEmail(emailClean)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String otp = generateAndSaveOtp(emailClean);

        try {
            emailService.sendPasswordResetOtpEmail(emailClean, otp);
            log.info("Password reset OTP sent to {}", emailClean);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to {}: {}", emailClean, e.getMessage());
            throw new RuntimeException("Failed to send reset code. Please try again later.");
        }
    }

    /**
     * FORGOT PASSWORD — STEP 2
     * Verifies the OTP against otp_requests, then issues a short-lived,
     * single-use reset token (stored hashed) that step 3 must present.
     */
    public String verifyResetOtp(String email, String otp) {
        if (email == null || otp == null) {
            throw new RuntimeException("Email and OTP are required");
        }
        String emailClean = email.trim().toLowerCase();

        OtpRequest otpRequest = otpRequestRepository.findByEmail(emailClean)
                .orElseThrow(() -> new RuntimeException("No OTP request found. Please request a new code."));

        if (otpRequest.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("OTP has expired. Please request a new code.");
        }
        if (otpRequest.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            throw new RuntimeException("Too many attempts. Please request a new code.");
        }

        otpRequest.setAttemptCount(otpRequest.getAttemptCount() + 1);
        otpRequestRepository.save(otpRequest);

        if (!passwordEncoder.matches(otp.trim(), otpRequest.getOtpHash())) {
            throw new RuntimeException("Incorrect code");
        }

        otpRequest.setVerified(true);
        otpRequestRepository.save(otpRequest);

        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String resetToken = HexFormat.of().formatHex(tokenBytes);
        String tokenHash = passwordEncoder.encode(resetToken);

        passwordResetTokenRepository.deleteByEmail(emailClean);
        passwordResetTokenRepository.flush();

        PasswordResetToken tokenEntity = new PasswordResetToken();
        tokenEntity.setEmail(emailClean);
        tokenEntity.setTokenHash(tokenHash);
        tokenEntity.setCreatedAt(Instant.now());
        tokenEntity.setExpiresAt(Instant.now().plus(RESET_TOKEN_VALIDITY_MINUTES, ChronoUnit.MINUTES));
        passwordResetTokenRepository.save(tokenEntity);

        return resetToken;
    }

    /**
     * FORGOT PASSWORD — STEP 3
     * Consumes the reset token issued by step 2 and sets the new password.
     */
    public void resetPassword(String email, String resetToken, String newPassword) {
        if (email == null || resetToken == null || newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Email, reset token, and new password are required");
        }
        if (newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }
        String emailClean = email.trim().toLowerCase();

        PasswordResetToken tokenEntity = passwordResetTokenRepository.findByEmail(emailClean)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset session. Please start over."));

        if (tokenEntity.getExpiresAt().isBefore(Instant.now())) {
            passwordResetTokenRepository.deleteByEmail(emailClean);
            throw new RuntimeException("Reset session expired. Please start over.");
        }
        if (!passwordEncoder.matches(resetToken, tokenEntity.getTokenHash())) {
            throw new RuntimeException("Invalid or expired reset session. Please start over.");
        }

        User user = userRepository.findByEmail(emailClean)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.deleteByEmail(emailClean);
        otpRequestRepository.deleteByEmail(emailClean);
    }

    public AuthResponse login(AuthRequest request) {
        User user = null;

        if (request.getEmail() != null && request.getOtp() != null) {
            String emailClean = request.getEmail().trim().toLowerCase();
            Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByEmail(emailClean);
            if (otpRequestOpt.isEmpty()) {
                throw new RuntimeException("No OTP request found for this email. Please request an OTP first.");
            }
            OtpRequest otpRequest = otpRequestOpt.get();

            if (otpRequest.getExpiresAt().isBefore(Instant.now())) {
                throw new RuntimeException("OTP has expired. Please request a new one.");
            }

            if (otpRequest.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                throw new RuntimeException("Too many OTP attempts. Please request a new OTP.");
            }

            otpRequest.setAttemptCount(otpRequest.getAttemptCount() + 1);
            otpRequestRepository.save(otpRequest);

            if (!passwordEncoder.matches(request.getOtp(), otpRequest.getOtpHash())) {
                throw new RuntimeException("Invalid OTP");
            }

            otpRequest.setVerified(true);
            otpRequestRepository.save(otpRequest);

            user = userRepository.findByEmail(emailClean)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            if (!"APPROVED".equals(user.getVerificationStatus())) {
                throw new RuntimeException("Account is not approved. Please wait for admin approval.");
            }
            if (!user.getPhoneVerified()) {
                user.setPhoneVerified(true);
                userRepository.save(user);
            }
        } else if (request.getEmail() != null && request.getPassword() != null) {
            String emailClean = request.getEmail().trim().toLowerCase();
            user = userRepository.findByEmail(emailClean)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            if (!"APPROVED".equals(user.getVerificationStatus())) {
                throw new RuntimeException("Account is not approved. Please wait for admin approval.");
            }
            if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
        } else {
            throw new RuntimeException("Invalid request");
        }

        Long storeId = null;
        if (user.getRole().equals("STORE_ADMIN")) {
            Optional<Store> storeOpt = storeRepository.findByOwnerId(user.getId());
            if (storeOpt.isPresent()) {
                storeId = storeOpt.get().getId();
            }
        }

        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getId(),
                storeId
        );

        return new AuthResponse(token, user.getRole(), user.getId(), storeId);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String role = request.getRole();
        if (!"CUSTOMER".equals(role) && !"STORE_ADMIN".equals(role) &&
            !"DELIVERY_PARTNER".equals(role)) {
            throw new RuntimeException("Invalid role: " + role);
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required for registration");
        }
        String emailClean = request.getEmail().trim().toLowerCase();

        if (request.getOtp() == null || request.getOtp().isBlank()) {
            throw new RuntimeException("OTP is required for registration");
        }

        Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByEmail(emailClean);
        if (otpRequestOpt.isEmpty()) {
            throw new RuntimeException("No OTP request found. Please request an OTP first.");
        }
        OtpRequest otpRequest = otpRequestOpt.get();

        if (otpRequest.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (otpRequest.isVerified()) {
            throw new RuntimeException("OTP already used. Please request a new one.");
        }

        if (otpRequest.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            throw new RuntimeException("Too many OTP attempts. Please request a new OTP.");
        }

        otpRequest.setAttemptCount(otpRequest.getAttemptCount() + 1);
        otpRequestRepository.save(otpRequest);

        if (!passwordEncoder.matches(request.getOtp(), otpRequest.getOtpHash())) {
            throw new RuntimeException("Invalid OTP");
        }

        otpRequest.setVerified(true);
        otpRequestRepository.save(otpRequest);

        if (userRepository.findByEmail(emailClean).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setEmail(emailClean);
        user.setFullName(request.getName());
        user.setRole(role);
        user.setPhoneVerified(true);

        if ("STORE_ADMIN".equals(role) || "DELIVERY_PARTNER".equals(role)) {
            user.setVerificationStatus("PENDING");
        } else {
            user.setVerificationStatus("APPROVED");
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        user = userRepository.save(user);

        Long storeId = null;
        if ("STORE_ADMIN".equals(role)) {
            if (request.getStoreName() == null || request.getStoreName().trim().isEmpty() ||
                request.getStoreAddress() == null || request.getStoreAddress().trim().isEmpty() ||
                request.getStoreLat() == null || request.getStoreLng() == null) {
                throw new RuntimeException("Store details (name, address, lat, lng) are required for STORE_ADMIN registration");
            }
            Store store = new Store();
            store.setOwner(user);
            store.setName(request.getStoreName());
            store.setAddress(request.getStoreAddress());
            try {
                org.locationtech.jts.geom.GeometryFactory geometryFactory = new org.locationtech.jts.geom.GeometryFactory(
                        new org.locationtech.jts.geom.PrecisionModel(), 4326);
                org.locationtech.jts.geom.Point point = geometryFactory.createPoint(
                        new org.locationtech.jts.geom.Coordinate(request.getStoreLng(), request.getStoreLat()));
                store.setLocation(point);
            } catch (Exception e) {
                throw new RuntimeException("Error creating location point: " + e.getMessage());
            }
            store.setVerificationStatus("PENDING");
            store = storeRepository.save(store);
            storeId = store.getId();
        }

        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getId(),
                storeId
        );

        return new AuthResponse(token, user.getRole(), user.getId(), storeId);
    }
}