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
            // Update admin password
            admin.setPasswordHash(passwordEncoder.encode("Dany@8712"));
            userRepository.save(admin);
            System.out.println("=== ADMIN PASSWORD RESET TO 'Dany@8712' ===");
        });
    }
}
