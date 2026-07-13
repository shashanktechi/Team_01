package com.quickcart.service;

import org.springframework.stereotype.Service;

@Service
public class AiProviderRouter {

    public String queryAi(String prompt) {
        try {
            // Attempt Groq first
            return callGroq(prompt);
        } catch (Exception e1) {
            try {
                // Fallback NVIDIA
                return callNvidia(prompt);
            } catch (Exception e2) {
                try {
                    // Fallback Gemini
                    return callGemini(prompt);
                } catch (Exception e3) {
                    return "AI Providers unavailable. Static fallback engaged.";
                }
            }
        }
    }

    private String callGroq(String prompt) {
        // Dummy implementation
        return "Groq response";
    }

    private String callNvidia(String prompt) {
        // Dummy implementation
        return "Nvidia response";
    }

    private String callGemini(String prompt) {
        // Dummy implementation
        return "Gemini response";
    }
}
