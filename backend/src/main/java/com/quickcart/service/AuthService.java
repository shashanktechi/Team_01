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
    // Max OTP send attempts per phone per window
    private static final int MAX_OTP_SEND_PER_WINDOW = 5;
    // Window for OTP send rate limiting in minutes
    private static final int OTP_SEND_WINDOW_MINUTES = 15;
    // Max OTP verification attempts
    private static final int MAX_OTP_ATTEMPTS = 5;

    /**
     * Sends an OTP to the given phone number via email (for now).
     * Implements rate limiting: max 5 sends per phone per 15 minutes.
     */
    public void sendOtp(String phone) {
        // Rate limiting: count how many OTPs have been sent in the last window
        long countSent = otpRequestRepository.countByPhoneAndCreatedAfter(
                phone,
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

        // Delete any existing OTP requests for this phone (to invalidate previous OTPs)
        otpRequestRepository.deleteByPhone(phone);

        // Save new OTP request
        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setPhone(phone);
        otpRequest.setOtpHash(otpHash);
        otpRequest.setExpiresAt(expiresAt);
        otpRequest.setCreatedAt(now);
        otpRequest.setAttemptCount(0);
        otpRequest.setVerified(false);
        otpRequestRepository.save(otpRequest);

        // For now, we send via email (since we don't have SMS gateway)
        // In production, replace with SMS provider (Twilio, MSG91, etc.)
        // Find user by phone to get email (if exists)
        User user = userRepository.findByPhone(phone).orElse(null);
        String email = (user != null && user.getEmail() != null) ? user.getEmail() : "unknown";
        emailService.sendOtpEmail(email, otp);
        System.out.println("OTP sent to " + email + " for phone " + phone);
    }

    public AuthResponse login(AuthRequest request) {
        User user = null;

        if (request.getPhone() != null && request.getOtp() != null) {
            // OTP login path
            Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByPhone(request.getPhone());
            if (otpRequestOpt.isEmpty()) {
                throw new RuntimeException("No OTP request found for this phone. Please request an OTP first.");
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
            user = userRepository.findByPhone(request.getPhone())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is active
            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            // Check if account is approved
            if (!"APPROVED".equals(user.getVerificationStatus())) {
                throw new RuntimeException("Account is not approved. Please wait for admin approval.");
            }
            // Mark phone as verified
            if (!user.getPhoneVerified()) {
                user.setPhoneVerified(true);
                userRepository.save(user);
            }
        } else if (request.getEmail() != null && request.getPassword() != null) {
            // Email/Password login for admin
            user = userRepository.findByEmail(request.getEmail())
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
                user.getPhone(),
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

        // For phone-based roles, we require OTP verification
        if ("CUSTOMER".equals(role) || "STORE_ADMIN".equals(role) ||
            "DELIVERY_PARTNER".equals(role)) {
            if (request.getOtp() == null || request.getOtp().isBlank()) {
                throw new RuntimeException("OTP is required for phone-based registration");
            }

            // Verify OTP
            Optional<OtpRequest> otpRequestOpt = otpRequestRepository.findByPhone(request.getPhone());
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
        }

        // Check if phone already registered
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already registered");
            }
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setFullName(request.getName());
        user.setRole(role);
        // For phone-based roles, we now have verified OTP, so set phoneVerified to true
        if ("CUSTOMER".equals(role) || "STORE_ADMIN".equals(role) || "DELIVERY_PARTNER".equals(role)) {
            user.setPhoneVerified(true);
        } else {
            // For SYSTEM_ADMIN (though not allowed here), we don't verify phone via OTP
            user.setPhoneVerified(false);
        }
        // Set verification status based on role
        if ("STORE_ADMIN".equals(role) || "DELIVERY_PARTNER".equals(role)) {
            user.setVerificationStatus("PENDING"); // pending admin approval
        } else {
            // CUSTOMER and SYSTEM_ADMIN (though SYSTEM_ADMIN is not allowed here) are auto-approved
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
            // Location point
            // We'll need to set the location using JTS
            // For simplicity, we'll skip setting the location here; the frontend should send it and we'll set it.
            // But we need to set it to save the store.
            // We'll create a point using the provided lat/lng.
            // We'll need to add the dependency for JTS, but it's already there.
            // We'll create a GeometryFactory and Point.
            // We'll do it here.
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
                user.getPhone(),
                user.getRole(),
                user.getId(),
                storeId
        );

        return new AuthResponse(token, user.getRole(), user.getId(), storeId);
    }
}