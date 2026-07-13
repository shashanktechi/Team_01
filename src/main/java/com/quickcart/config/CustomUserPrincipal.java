package com.quickcart.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomUserPrincipal implements Principal {
    private Long userId;
    private String phone;
    private String role;
    private Long storeId;

    @Override
    public String getName() {
        return this.phone;
    }
}
