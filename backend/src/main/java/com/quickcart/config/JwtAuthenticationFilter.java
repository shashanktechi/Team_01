package com.quickcart.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        // Pass OPTIONS preflight requests through immediately — CORS handler manages them
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtTokenProvider.validateJwtToken(jwt)) {
                String phone = jwtTokenProvider.getPhoneFromJwtToken(jwt);
                String role = jwtTokenProvider.getRoleFromJwtToken(jwt);
                Long userId = jwtTokenProvider.getUserIdFromJwtToken(jwt);
                Long storeId = jwtTokenProvider.getStoreIdFromJwtToken(jwt);

                CustomUserPrincipal principal = new CustomUserPrincipal(userId, phone, role, storeId);
                java.util.List<SimpleGrantedAuthority> authorities;
                if ("SYSTEM_ADMIN".equals(role)) {
                    authorities = java.util.List.of(
                        new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_CUSTOMER"),
                        new SimpleGrantedAuthority("ROLE_STORE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_DELIVERY_PARTNER")
                    );
                } else {
                    authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
                }
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: Invalid or expired token\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
