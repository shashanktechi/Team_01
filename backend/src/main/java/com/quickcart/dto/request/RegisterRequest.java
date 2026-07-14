package com.quickcart.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;
    private String password;

    @NotBlank(message = "Full name is required")
    private String name;

    @NotBlank(message = "Role is required")
    private String role; // CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN

    private String storeName;
    private String storeAddress;
    private Double storeLat;
    private Double storeLng;
}
