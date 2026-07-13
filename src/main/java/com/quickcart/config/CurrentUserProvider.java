package com.quickcart.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public CustomUserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserPrincipal) {
            return (CustomUserPrincipal) auth.getPrincipal();
        }
        return null;
    }

    public Long getCurrentUserId() {
        CustomUserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getUserId() : null;
    }

    public Long getCurrentStoreId() {
        CustomUserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getStoreId() : null;
    }
}
