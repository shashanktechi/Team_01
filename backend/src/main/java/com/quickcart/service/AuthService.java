package com.quickcart.service;

import com.quickcart.config.JwtTokenProvider;
import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.request.RegisterRequest;
import com.quickcart.dto.response.AuthResponse;
import com.quickcart.entity.OtpRequest;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.OtpRequestRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private OtpRequestRepository otpRequestRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // OTP validity in minutes
    private static final long OTP_VALIDITY_MINUTES = 10;
    // Max OTP send attempts per email per window
    private static final int MAX_OTP_SEND_PER_WINDOW = 5;
    // Window for OTP send rate limiting in minutes
    private static final int OTP_SEND_WINDOW_MINUTES = 15;
    // Max OTP verification attempts
    private static final int MAX_OTP_ATTEMPTS = 5;

    /**
     * Sends an OTP to the given email address.
     * Implements rate limiting: max 5 sends per email per 15 minutes.
     */
    public void sendOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String emailClean = email.trim().toLowerCase();

        // Rate limiting: count how many OTPs have been sent in the last window
        long countSent = otpRequestRepository.countByEmailAndCreatedAtAfter(
                emailClean,
                Instant.now().minus(OTP_SEND_WINDOW_MINUTES, ChronoUnit.MINUTES)
        );
        if (countSent >= MAX_OTP_SEND_PER_WINDOW) {
            throw new RuntimeException("OTP send limit exceeded. Please try again later.");
        }

        // Generate a 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        String otpHash = passwordEncoder.encode(otp);

        // Set expiration and creation times
        Instant now = Instant.now();
        Instant expiresAt = now.plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES);

        // Delete any existing OTP requests for this email (to invalidate previous OTPs)
        otpRequestRepository.deleteByEmail(emailClean);
        otpRequestRepository.flush();

        // Save new OTP request
        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setEmail(emailClean);
        otpRequest.setOtpHash(otpHash);
        otpRequest.setExpiresAt(expiresAt);
        otpRequest.setCreatedAt(now);
        otpRequest.setAttemptCount(0);
        otpRequest.setVerified(false);
        otpRequestRepository.save(otpRequest);

        // Send via email
        try {
            emailService.sendOtpEmail(emailClean, otp);
            System.out.println("OTP sent to " + emailClean);
        } catch (Exception e) {
            System.err.println("FAILED to send OTP email: " + e.getMessage());
        }
        System.out.println("==========================================");
        System.out.println("DEVELOPMENT OTP FOR " + emailClean + ": " + otp);
        System.out.println("==========================================");
    }

    public AuthResponse login(AuthRequest request) {
        User user = null;

        if (request.getEmail() != null && request.getOtp() != null) {
            // OTP login path
            String emailClean = request.getEmail().trim().toLowerCase();
            Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByEmail(emailClean);
            if (otpRequestOpt.isEmpty()) {
                throw new RuntimeException("No OTP request found for this email. Please request an OTP first.");
            }
            OtpRequest otpRequest = otpRequestOpt.get();

            // Check if OTP has expired
            if (otpRequest.getExpiresAt().isBefore(Instant.now())) {
                throw new RuntimeException("OTP has expired. Please request a new one.");
            }

            // Check if too many attempts
            if (otpRequest.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                throw new RuntimeException("Too many OTP attempts. Please request a new OTP.");
            }

            // Increment attempt count
            otpRequest.setAttemptCount(otpRequest.getAttemptCount() + 1);
            otpRequestRepository.save(otpRequest);

            // Check OTP matches
            if (!passwordEncoder.matches(request.getOtp(), otpRequest.getOtpHash())) {
                throw new RuntimeException("Invalid OTP");
            }

            // OTP is correct
            otpRequest.setVerified(true);
            otpRequestRepository.save(otpRequest);

            // Retrieve user
            user = userRepository.findByEmail(emailClean)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is active
            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            // Check if account is approved
            if (!"APPROVED".equals(user.getVerificationStatus())) {
                throw new RuntimeException("Account is not approved. Please wait for admin approval.");
            }
            // Mark phone/email as verified
            if (!user.getPhoneVerified()) {
                user.setPhoneVerified(true);
                userRepository.save(user);
            }
        } else if (request.getEmail() != null && request.getPassword() != null) {
            // Email/Password login
            String emailClean = request.getEmail().trim().toLowerCase();
            user = userRepository.findByEmail(emailClean)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            // Check if account is active
            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            // Check if account is approved
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
            // For store admins, get their store ID
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

        // For all registration roles, we now require email OTP verification
        if (request.getOtp() == null || request.getOtp().isBlank()) {
            throw new RuntimeException("OTP is required for registration");
        }

        // Verify OTP
        Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByEmail(emailClean);
        if (otpRequestOpt.isEmpty()) {
            throw new RuntimeException("No OTP request found. Please request an OTP first.");
        }
        OtpRequest otpRequest = otpRequestOpt.get();

        // Check if OTP has expired
        if (otpRequest.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Check if already verified
        if (otpRequest.isVerified()) {
            throw new RuntimeException("OTP already used. Please request a new one.");
        }

        // Check attempts
        if (otpRequest.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            throw new RuntimeException("Too many OTP attempts. Please request a new OTP.");
        }

        // Increment attempt count
        otpRequest.setAttemptCount(otpRequest.getAttemptCount() + 1);
        otpRequestRepository.save(otpRequest);

        // Check OTP matches
        if (!passwordEncoder.matches(request.getOtp(), otpRequest.getOtpHash())) {
            throw new RuntimeException("Invalid OTP");
        }

        // OTP is correct
        otpRequest.setVerified(true);
        otpRequestRepository.save(otpRequest);

        // Check if email already registered
        if (userRepository.findByEmail(emailClean).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setEmail(emailClean);
        user.setFullName(request.getName());
        user.setRole(role);
        user.setPhoneVerified(true);

        // Set verification status based on role
        if ("STORE_ADMIN".equals(role) || "DELIVERY_PARTNER".equals(role)) {
            user.setVerificationStatus("PENDING"); // pending admin approval
        } else {
            // CUSTOMER is auto-approved
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