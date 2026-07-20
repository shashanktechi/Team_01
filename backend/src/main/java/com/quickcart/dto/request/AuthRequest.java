package com.quickcart.dto.request;

import lombok.Data;

@Data
@ValidAuthRequest
public class AuthRequest {
    private String phone;
    private String email;
    private String username;
    private String password;
    private String otp;
}
