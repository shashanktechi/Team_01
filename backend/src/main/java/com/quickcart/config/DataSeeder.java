package com.quickcart.config;

import org.springframework.jdbc.core.JdbcTemplate;
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
    private JdbcTemplate jdbcTemplate;

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
        try {
            jdbcTemplate.execute("ALTER TABLE audit_logs ALTER COLUMN ip_address TYPE VARCHAR(45)");
            System.out.println("Migrated audit_logs ip_address to VARCHAR");
        } catch (Exception e) {
            System.out.println("ip_address Migration skipped or failed: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE audit_logs ALTER COLUMN metadata TYPE TEXT");
            System.out.println("Migrated audit_logs metadata to TEXT");
        } catch (Exception e) {
            System.out.println("metadata Migration skipped or failed: " + e.getMessage());
        }

        
        try {
            jdbcTemplate.execute("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4))");
            jdbcTemplate.execute("DELETE FROM orders WHERE store_id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4)");
            jdbcTemplate.execute("DELETE FROM inventory WHERE store_id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4)");
            jdbcTemplate.execute("DELETE FROM daily_demand WHERE store_id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4)");
            jdbcTemplate.execute("DELETE FROM audit_logs WHERE target_store_id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4)");
            jdbcTemplate.execute("DELETE FROM stores WHERE id NOT IN (SELECT id FROM stores ORDER BY id ASC LIMIT 4)");
            System.out.println("Cleaned up redundant stores safely.");
            
            // Fix existing store owners' verification statuses
            jdbcTemplate.execute("UPDATE users u SET verification_status = s.verification_status, is_active = (s.verification_status = 'APPROVED') FROM stores s WHERE u.id = s.owner_id");
            System.out.println("Fixed existing store owners' verification status");
        } catch (Exception e) {
            System.out.println("Store cleanup skipped or failed: " + e.getMessage());
        }

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
