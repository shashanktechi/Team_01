package com.quickcart.service;

import com.quickcart.config.JwtTokenProvider;
import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.request.RegisterRequest;
import com.quickcart.dto.response.AuthResponse;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendOtp(String phone) {
        // Mock OTP sending
        System.out.println("OTP sent to " + phone + ": 1234");
    }

    public AuthResponse login(AuthRequest request) {
        User user = null;
        
        if (request.getPhone() != null && request.getOtp() != null) {
            // Mock OTP verification
            if (!"1234".equals(request.getOtp())) {
                throw new RuntimeException("Invalid OTP");
            }
            user = userRepository.findByPhone(request.getPhone())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else if (request.getEmail() != null && request.getPassword() != null) {
            // Email/Password login for admin
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getPasswordHash() != null && !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
        } else {
            throw new RuntimeException("Invalid request");
        }

        Long storeId = null;
        if ("STORE_ADMIN".equals(user.getRole())) {
            Optional<Store> storeOpt = storeRepository.findByOwnerId(user.getId());
            if (storeOpt.isPresent()) {
                storeId = storeOpt.get().getId();
            }
        }

        String token = jwtTokenProvider.generateToken(user.getPhone(), user.getRole(), user.getId(), storeId);
        
        return new AuthResponse(token, user.getRole(), user.getId(), storeId);
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse register(RegisterRequest request) {
        String role = request.getRole();
        if (!"CUSTOMER".equals(role) && !"STORE_ADMIN".equals(role) && 
            !"DELIVERY_PARTNER".equals(role) && !"SYSTEM_ADMIN".equals(role)) {
            throw new RuntimeException("Invalid role: " + role);
        }

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
            
            org.locationtech.jts.geom.GeometryFactory geometryFactory = new org.locationtech.jts.geom.GeometryFactory(
                    new org.locationtech.jts.geom.PrecisionModel(), 4326);
            org.locationtech.jts.geom.Point point = geometryFactory.createPoint(
                    new org.locationtech.jts.geom.Coordinate(request.getStoreLng(), request.getStoreLat()));
            store.setLocation(point);
            store.setVerificationStatus("PENDING");
            store = storeRepository.save(store);
            storeId = store.getId();
        }

        String token = jwtTokenProvider.generateToken(user.getPhone(), user.getRole(), user.getId(), storeId);
        return new AuthResponse(token, user.getRole(), user.getId(), storeId);
    }
}
