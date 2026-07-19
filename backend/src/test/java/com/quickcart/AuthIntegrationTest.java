package com.quickcart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickcart.dto.request.AuthRequest;
import com.quickcart.dto.request.RegisterRequest;
import com.quickcart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
    }

    @Test
    void testCustomerRegistrationAndLogin() throws Exception {
        // 1. Send OTP
        AuthRequest otpRequest = new AuthRequest();
        otpRequest.setEmail("test@example.com");
        otpRequest.setPhone("1234567890");

        mockMvc.perform(post("/api/auth/otp/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(otpRequest)))
                .andExpect(status().isOk());

        // 2. Register with OTP
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("test@example.com");
        registerReq.setPhone("1234567890");
        registerReq.setName("Test User");
        registerReq.setPassword("password123");
        registerReq.setRole("CUSTOMER");
        // In test mode, OTP is static "123456"
        registerReq.setOtp("123456");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));

        // 3. Login
        AuthRequest loginReq = new AuthRequest();
        loginReq.setEmail("test@example.com");
        loginReq.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}
