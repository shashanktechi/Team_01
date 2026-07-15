package com.quickcart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@SuppressWarnings({"unchecked", "null"})
public class AiProviderRouter {

    @Value("${ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.nvidia.api-key:}")
    private String nvidiaApiKey;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.xai.api-key:}")
    private String xaiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String queryAi(String prompt) {
        try {
            // Attempt xAI (Grok) first
            return callXai(prompt);
        } catch (Exception e0) {
            try {
                // Fallback Gemini
                return callGemini(prompt);
            } catch (Exception e1) {
                try {
                    // Fallback NVIDIA
                    return callNvidia(prompt);
                } catch (Exception e2) {
                    try {
                        // Fallback Groq
                        return callGroq(prompt);
                    } catch (Exception e3) {
                        return "AI Providers unavailable. Static fallback engaged.";
                    }
                }
            }
        }
    }

    private String callXai(String prompt) {
        if (xaiApiKey == null || xaiApiKey.trim().isEmpty() || xaiApiKey.contains("your_")) {
            throw new RuntimeException("xAI API key not configured");
        }

        try {
            String url = "https://api.x.ai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(xaiApiKey);

            Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "grok-3-mini",
                "messages", List.of(message),
                "max_tokens", 1000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> msg = (Map<String, Object>) firstChoice.get("message");
                        if (msg != null) {
                            return (String) msg.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from xAI API");
        } catch (Exception e) {
            throw new RuntimeException("xAI API call failed: " + e.getMessage(), e);
        }
    }

    private String callGroq(String prompt) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.contains("your_")) {
            throw new RuntimeException("Groq API key not configured");
        }

        try {
            String url = "https://api.groq.com/openai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            Map<String, Object> messages = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "mixtral-8x7b-32768",
                "messages", List.of(messages),
                "max_tokens", 1000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from Groq API");
        } catch (Exception e) {
            throw new RuntimeException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    private String callNvidia(String prompt) {
        if (nvidiaApiKey == null || nvidiaApiKey.trim().isEmpty() || nvidiaApiKey.contains("your_")) {
            throw new RuntimeException("NVIDIA API key not configured");
        }

        try {
            // Using NVIDIA's Nemotron 3 8B model via their API
            String url = "https://integrate.api.nvidia.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(nvidiaApiKey);

            Map<String, Object> messages = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "nvidia/nemotron-3-8b-instruct",
                "messages", List.of(messages),
                "max_tokens", 1000,
                "temperature", 0.7,
                "top_p", 0.9
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from NVIDIA API");
        } catch (Exception e) {
            throw new RuntimeException("NVIDIA API call failed: " + e.getMessage(), e);
        }
    }

    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("your_")) {
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> parts = Map.of(
                "text", prompt
            );

            Map<String, Object> content = Map.of(
                "parts", List.of(parts)
            );

            Map<String, Object> payload = Map.of(
                "contents", List.of(content)
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> candidates = (List<?>) body.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
                        Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
                        if (contentResponse != null) {
                            List<?> partsResponse = (List<?>) contentResponse.get("parts");
                            if (partsResponse != null && !partsResponse.isEmpty()) {
                                Map<String, Object> firstPart = (Map<String, Object>) partsResponse.get(0);
                                if (firstPart != null) {
                                    return (String) firstPart.get("text");
                                }
                            }
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from Gemini API");
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }
}
