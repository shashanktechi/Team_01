package com.quickcart.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be 10-15 digits and can optionally start with +")
    private String phone;

    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Full name is required")
    private String name;

    @NotBlank(message = "Role is required")
    private String role; // CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN

    private String storeName;
    private String city;
    private String storeAddress;
    private Double storeLat;
    private Double storeLng;
    private String otp;
}
