package com.quickcart.config;

import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@quickcart.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.demo.email:demo@quickcart.com}")
    private String demoEmail;

    @Value("${app.demo.password:Demo@123}")
    private String demoPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUser(adminEmail, adminPassword, "Admin", "+919876543213", "+919999999991");
        seedUser(demoEmail, demoPassword, "Demo Admin", "+919876543214", "+919999999992");
    }

    private void seedUser(String email, String password, String fullName, String primaryPhone, String fallbackPhone) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            User user = opt.get();
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole("SYSTEM_ADMIN");
            user.setIsActive(true);
            user.setVerificationStatus("APPROVED");
            userRepository.save(user);
        } else {
            User user = new User();
            user.setEmail(email);
            // Try primary phone, if it exists (by another user), use fallback
            if (userRepository.findByPhone(primaryPhone).isPresent()) {
                user.setPhone(fallbackPhone);
            } else {
                user.setPhone(primaryPhone);
            }
            user.setFullName(fullName);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole("SYSTEM_ADMIN");
            user.setIsActive(true);
            user.setVerificationStatus("APPROVED");
            userRepository.save(user);
        }
    }
}
