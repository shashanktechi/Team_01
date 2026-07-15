package com.quickcart.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

/**
 * Intercepts STOMP messages to authenticate users via JWT and authorize topic subscriptions.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor =
                org.springframework.messaging.simp.stomp.StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            java.util.List<String> authHeader = accessor.getNativeHeader("Authorization");
            if (authHeader == null || authHeader.isEmpty()) {
                return null; // Reject connection
            }
            String token = authHeader.get(0);
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            if (!jwtTokenProvider.validateJwtToken(token)) {
                return null; // Reject connection
            }
            // Extract claims and set user
            String phone = jwtTokenProvider.getPhoneFromJwtToken(token);
            String role = jwtTokenProvider.getRoleFromJwtToken(token);
            Long userId = jwtTokenProvider.getUserIdFromJwtToken(token);
            Long storeId = jwtTokenProvider.getStoreIdFromJwtToken(token);
            UserPrincipal principal = new UserPrincipal(phone, role, userId, storeId);
            Authentication auth =
                    new UsernamePasswordAuthenticationToken(principal, null,
                            AuthorityUtils.createAuthorityList("ROLE_" + role));
            accessor.setUser(auth);
            accessor.setLeaveMutable(true);
        }

        // Handle SUBSCRIBE: validate destination against authenticated user
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            Authentication auth = (Authentication) accessor.getUser();
            if (auth == null || !auth.isAuthenticated()) {
                return null; // Reject subscription: not authenticated
            }
            String destination = accessor.getDestination();
            if (destination == null) {
                return null; // Reject: no destination
            }
            // Extract the ID from destination, e.g., /topic/customer/123 -> 123
            // We'll do a simple prefix check; in a real app, you might use a proper parser.
            if (destination.startsWith("/topic/customer/")) {
                // Customer can only subscribe to their own customerId
                String idStr = destination.substring("/topic/customer/".length());
                Long customerId = Long.valueOf(idStr);
                // Get the authenticated user's ID from principal
                if (auth.getPrincipal() instanceof UserPrincipal) {
                    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
                    if (!principal.getUserId().equals(customerId)) {
                        return null; // Reject: customer ID mismatch
                    }
                } else {
                    return null; // Reject: unexpected principal type
                }
            } else if (destination.startsWith("/topic/store/")) {
                // Store admin can only subscribe to their own storeId
                String idStr = destination.substring("/topic/store/".length());
                Long storeId = Long.valueOf(idStr);
                if (auth.getPrincipal() instanceof UserPrincipal) {
                    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
                    if (!principal.getStoreId().equals(storeId)) {
                        return null; // Reject: store ID mismatch
                    }
                } else {
                    return null;
                }
            } else if (destination.startsWith("/topic/delivery/")) {
                // Delivery partner can only subscribe to their own userId (as delivery partner)
                String idStr = destination.substring("/topic/delivery/".length());
                Long userId = Long.valueOf(idStr);
                if (auth.getPrincipal() instanceof UserPrincipal) {
                    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
                    if (!principal.getUserId().equals(userId)) {
                        return null; // Reject: user ID mismatch
                    }
                } else {
                    return null;
                }
            }
            // SYSTEM_ADMIN: allow any topic (no additional check)
            // For other destinations, we allow (or could reject; but we allow for simplicity)
        }

        return message;
    }

    /**
     * Simple principal to hold user details.
     */
    public static class UserPrincipal {
        private final String phone;
        private final String role;
        private final Long userId;
        private final Long storeId;

        public UserPrincipal(String phone, String role, Long userId, Long storeId) {
            this.phone = phone;
            this.role = role;
            this.userId = userId;
            this.storeId = storeId;
        }

        public String getPhone() {
            return phone;
        }

        public String getRole() {
            return role;
        }

        public Long getUserId() {
            return userId;
        }

        public Long getStoreId() {
            return storeId;
        }
    }
}