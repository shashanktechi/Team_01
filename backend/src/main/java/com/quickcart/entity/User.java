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
    @com.fasterxml.jackson.annotation.JsonIgnore
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

    // --- KYC Documents (Delivery Agent) ---
    @Column(name = "ssc_cert_url")
    private String sscCertUrl;
    @Column(name = "ssc_verified")
    private Boolean sscVerified = false;

    @Column(name = "inter_cert_url")
    private String interCertUrl;
    @Column(name = "inter_verified")
    private Boolean interVerified = false;

    @Column(name = "driver_license_url")
    private String driverLicenseUrl;
    @Column(name = "driver_license_verified")
    private Boolean driverLicenseVerified = false;

    @Column(name = "bike_rc_url")
    private String bikeRcUrl;
    @Column(name = "bike_rc_verified")
    private Boolean bikeRcVerified = false;

    @Column(name = "other_cert_url")
    private String otherCertUrl;
    @Column(name = "other_cert_verified")
    private Boolean otherCertVerified = false;

    @Column(name = "aadhar_url")
    private String aadharUrl;
    @Column(name = "aadhar_verified")
    private Boolean aadharVerified = false;
    // ----------------------------------------

    @Column(name = "verification_status")
    private String verificationStatus = "PENDING";

    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;

    @Column(length = 100)
    private String city;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "vehicle_name", length = 50)
    private String vehicleName;

    @Column(name = "vehicle_model", length = 50)
    private String vehicleModel;

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    @Column(name = "vehicle_photo_url")
    private String vehiclePhotoUrl;

    @Column(length = 255)
    private String address;
}
