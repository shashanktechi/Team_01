package com.quickcart.config;

import com.quickcart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminPasswordResetRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminPasswordResetRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        userRepository.findByEmail("shashankdany8712@gmail.com").ifPresent(admin -> {
            // Update admin password to 'Password123!' so it can be tested in Postman
            admin.setPasswordHash(passwordEncoder.encode("Password123!"));
            userRepository.save(admin);
            System.out.println("=== ADMIN PASSWORD RESET TO 'Password123!' ===");
        });
    }
}
