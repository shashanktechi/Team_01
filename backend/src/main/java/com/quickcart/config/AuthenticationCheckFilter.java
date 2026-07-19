package com.quickcart.config;

import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthenticationCheckFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Skip authentication check for auth endpoints, websocket, and swagger (same as SecurityConfig)
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") ||
            path.startsWith("/ws/") ||
            path.startsWith("/swagger-ui/") ||
            path.startsWith("/v3/api-docs/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get current user from security context
        CustomUserPrincipal principal = currentUserProvider.getCurrentUser();
        if (principal != null) {
            // Fetch the user from database to check current status
            User user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is active
            if (!user.getIsActive()) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Account is deactivated");
                return;
            }

            // Check verification status for roles that require approval
            String role = principal.getRole();
            if (("STORE_ADMIN".equals(role) || "DELIVERY_PARTNER".equals(role)) &&
                    !"APPROVED".equals(user.getVerificationStatus())) {
                response.sendError(HttpStatus.FORBIDDEN.value(),
                        "Account is not approved. Please wait for admin approval.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
