package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = true, length = 50)
    private String username;

    @Column(unique = true, nullable = true, length = 20)
    private String phone;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false, length = 50)
    private String role; // CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN

    @Column(name = "trust_score")
    private Integer trustScore = 50;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "fcm_token")
    private String fcmToken;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "vehicle_doc_url")
    private String vehicleDocUrl;

    @Column(name = "verification_status")
    private String verificationStatus = "PENDING";

    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;

    @Column(length = 100)
    private String city;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;
}
