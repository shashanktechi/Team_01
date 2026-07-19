package com.quickcart;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoleGuardTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void testCustomerCannotAccessStoreEndpoints() throws Exception {
        mockMvc.perform(get("/api/store/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STORE_ADMIN")
    void testStoreAdminCannotAccessDeliveryEndpoints() throws Exception {
        mockMvc.perform(get("/api/delivery/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticatedUserCannotAccessCustomerEndpoints() throws Exception {
        mockMvc.perform(get("/api/customer/orders"))
                .andExpect(status().isUnauthorized()); // Or 403, depending on SecurityConfig handling
    }
}
