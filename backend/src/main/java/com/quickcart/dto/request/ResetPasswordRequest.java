package com.quickcart.dto.request;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String resetToken;
    private String newPassword;
}