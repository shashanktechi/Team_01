package com.quickcart.config;

import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String adminEmail = "shashankdany8712@gmail.com";
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPasswordHash(passwordEncoder.encode("Dany@8712"));
            admin.setRole("SYSTEM_ADMIN");
            admin.setIsActive(true);
            admin.setVerificationStatus("APPROVED");
            userRepository.save(admin);
        } else {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPhone("+919876543213");
            admin.setFullName("Admin");
            admin.setPasswordHash(passwordEncoder.encode("Dany@8712"));
            admin.setRole("SYSTEM_ADMIN");
            admin.setIsActive(true);
            admin.setVerificationStatus("APPROVED");

            userRepository.save(admin);
        }

        // Seed the requested demo admin
        String demoEmail = "todo70392@gmail.com";
        Optional<User> demoOpt = userRepository.findByEmail(demoEmail);
        if (demoOpt.isPresent()) {
            User demo = demoOpt.get();
            demo.setPasswordHash(passwordEncoder.encode("todo@987"));
            demo.setRole("SYSTEM_ADMIN");
            demo.setIsActive(true);
            demo.setVerificationStatus("APPROVED");
            userRepository.save(demo);
        } else {
            User demo = new User();
            demo.setEmail(demoEmail);
            demo.setPhone("+919876543214");
            demo.setFullName("Demo Admin");
            demo.setPasswordHash(passwordEncoder.encode("todo@987"));
            demo.setRole("SYSTEM_ADMIN");
            demo.setIsActive(true);
            demo.setVerificationStatus("APPROVED");
            userRepository.save(demo);
        }
    }
}
