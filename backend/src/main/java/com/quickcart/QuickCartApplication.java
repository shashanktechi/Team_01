package com.quickcart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class QuickCartApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(QuickCartApplication.class, args);
    }

    /**
     * Loads environment variables from a .env file and sets them as system properties.
     * Spring Boot resolves ${VAR} placeholders from both env vars and system properties,
     * so this ensures the app works whether run from IDE, terminal, or any working directory.
     */
    private static void loadEnvFile() {
        Path[] candidates = {
            Path.of(".env"),
            Path.of("backend/.env"),
            Path.of("backend", ".env")
        };

        for (Path envPath : candidates) {
            if (Files.exists(envPath)) {
                try {
                    List<String> lines = Files.readAllLines(envPath);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                        int eqIdx = trimmed.indexOf('=');
                        if (eqIdx <= 0) continue;
                        String key = trimmed.substring(0, eqIdx).trim();
                        String value = trimmed.substring(eqIdx + 1).trim();
                        // Only set if not already defined as an environment variable
                        if (System.getenv(key) == null && System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    System.out.println("[QuickCart] Loaded .env from: " + envPath.toAbsolutePath());
                    return;
                } catch (Exception e) {
                    System.err.println("[QuickCart] Warning: Failed to load .env from " + envPath + ": " + e.getMessage());
                }
            }
        }
        System.out.println("[QuickCart] No .env file found, relying on environment variables.");
    }
}
