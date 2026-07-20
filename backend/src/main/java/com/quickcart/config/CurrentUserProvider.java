package com.quickcart.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    @Autowired(required = false)
    private com.quickcart.repository.StoreRepository storeRepository;

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
        if (principal == null) {
            return null;
        }
        Long storeId = principal.getStoreId();
        if (storeId == null && "SYSTEM_ADMIN".equals(principal.getRole())) {
            if (storeRepository != null) {
                java.util.List<com.quickcart.entity.Store> stores = storeRepository.findAll();
                if (!stores.isEmpty()) {
                    return stores.get(0).getId();
                }
            }
        }
        if (storeId == null && "STORE_ADMIN".equals(principal.getRole())) {
            if (storeRepository != null) {
                java.util.Optional<com.quickcart.entity.Store> storeOpt = storeRepository.findByOwnerId(principal.getUserId());
                if (storeOpt.isPresent()) {
                    return storeOpt.get().getId();
                }
            }
        }
        return storeId;
    }
}
