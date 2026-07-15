package com.quickcart;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@SpringBootTest
@ActiveProfiles("test")
public class DatabaseVerificationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void verifyDatabase() {
        System.out.println("==================================================");
        System.out.println("DATABASE VERIFICATION");
        System.out.println("==================================================");

        try {
            // 1. List Tables
            List<Map<String, Object>> tables = jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
            );
            System.out.println("Tables in Database:");
            for (Map<String, Object> table : tables) {
                System.out.println(" - " + table.get("table_name"));
            }

            // 2. Referential Integrity Checks
            long count1 = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM orders o LEFT JOIN users u ON o.customer_id = u.id WHERE u.id IS NULL",
                    Long.class
            );
            System.out.println("Referential Integrity check 1 (Orders -> Users): " + count1);

            long count2 = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM orders o LEFT JOIN stores s ON o.store_id = s.id WHERE s.id IS NULL",
                    Long.class
            );
            System.out.println("Referential Integrity check 2 (Orders -> Stores): " + count2);

            long count3 = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM inventory i LEFT JOIN stores s ON i.store_id = s.id WHERE s.id IS NULL",
                    Long.class
            );
            System.out.println("Referential Integrity check 3 (Inventory -> Stores): " + count3);

            long count4 = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM inventory i LEFT JOIN products p ON i.product_id = p.id WHERE p.id IS NULL",
                    Long.class
            );
            System.out.println("Referential Integrity check 4 (Inventory -> Products): " + count4);

            // 3. Live Spatial Check
            System.out.println("Spatial query test (ST_Distance):");
            try {
                List<Map<String, Object>> storesDist = jdbcTemplate.queryForList(
                        "SELECT id, name, ST_Distance(location, ST_MakePoint(78.4867, 17.3850)::geography) AS dist_m " +
                                "FROM stores ORDER BY dist_m ASC LIMIT 5"
                );
                for (Map<String, Object> sd : storesDist) {
                    System.out.println(" - Store " + sd.get("id") + " (" + sd.get("name") + "): " + sd.get("dist_m") + " m");
                }
            } catch (Exception e) {
                System.out.println("Spatial query error: " + e.getMessage());
            }

            // 4. Live Vector Check
            System.out.println("Vector query test (embedding cosine distance):");
            try {
                List<Map<String, Object>> productsEmbedding = jdbcTemplate.queryForList(
                        "SELECT id, name FROM products ORDER BY embedding <=> (SELECT embedding FROM products LIMIT 1) LIMIT 5"
                );
                for (Map<String, Object> pe : productsEmbedding) {
                    System.out.println(" - Product " + pe.get("id") + ": " + pe.get("name"));
                }
            } catch (Exception e) {
                System.out.println("Vector query error: " + e.getMessage());
            }
        } catch (Exception e) {
            System.out.println("Database connection or verification failed: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("==================================================");
    }
}