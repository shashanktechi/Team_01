package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String phone;

    @Column(unique = true)
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
}
