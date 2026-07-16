package com.quickcart.dto.request;

import lombok.Data;

@Data
public class VerifyResetOtpRequest {
    private String email;
    private String otp;
}