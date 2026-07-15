package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "otp_requests",
        indexes = {
                @Index(name = "idx_otp_requests_phone", columnList = "phone"),
                @Index(name = "idx_otp_requests_expires_at", columnList = "expires_at"),
                @Index(name = "idx_otp_requests_created_at", columnList = "created_at")
        })
public class OtpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String otpHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt;

    private int attemptCount = 0;

    private boolean verified = false;

    // Getters and setters (omitted for brevity as Lombok @Data generates them)
}