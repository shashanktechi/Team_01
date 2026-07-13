package com.quickcart.dto.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String phone;
    private String email;
    private String password;
    private String otp;
}
