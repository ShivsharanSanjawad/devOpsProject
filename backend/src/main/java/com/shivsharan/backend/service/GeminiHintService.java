package com.shivsharan.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.shivsharan.backend.DTO.CodeHintRequest;
import com.shivsharan.backend.DTO.CodeHintResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiHintService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiHintService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Client client;
    private final String model;

    private final String promptTemplate = """
            You are an expert programming tutor. A student has submitted code that produces errors.
            Your job is to analyze the code and errors, then provide helpful HINTS — do NOT give the full solution directly.
            Guide the student towards fixing the issues themselves.
            
            ### LANGUAGE
            %s
            
            ### SUBMITTED CODE
            ```
            %s
            ```
            
            ### ERRORS
            ```
            %s
            ```
            
            ### INSTRUCTIONS
            1. Identify each distinct error in the code.
            2. For each error, provide a short, clear hint that nudges the student toward the fix WITHOUT giving the exact corrected code.
            3. Provide a brief summary of what's wrong overall.
            4. Optionally, provide a small corrected snippet ONLY for the trickiest error (not the whole code).
            
            ### OUTPUT FORMAT
            Return ONLY valid JSON with no markdown formatting. Structure:
            {
              "hints": ["hint1", "hint2", ...],
              "summary": "Brief overall summary of issues",
              "correctedSnippet": "Small corrected snippet for the hardest error, or empty string if hints are sufficient"
            }
            """;

    public GeminiHintService(@Value("${gemini.api.key}") String apiKey,
                             @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.model = model;
        logger.info("GeminiHintService initialized with model: {}", model);
    }

    public CodeHintResponse getHints(CodeHintRequest request) {
        String language = (request.getLanguage() != null) ? request.getLanguage() : "unknown";
        String code = (request.getCode() != null) ? request.getCode() : "";
        String errors = (request.getErrors() != null) ? request.getErrors() : "No error details provided";

        String prompt = String.format(promptTemplate, language, code, errors);
        logger.info("Sending code hint request to Gemini for language: {}", language);

        try {
            GenerateContentResponse response = client.models.generateContent(
                    model,
                    prompt,
                    null
            );

            String rawText = response.text();
            logger.info("Gemini response received, length: {}", rawText != null ? rawText.length() : 0);

            return parseHintResponse(rawText);

        } catch (Exception e) {
            logger.error("Gemini API call failed: {}", e.getMessage(), e);
            CodeHintResponse fallback = new CodeHintResponse();
            fallback.setHints(List.of("AI hint service is temporarily unavailable. Review your error messages carefully."));
            fallback.setSummary("Could not reach Gemini API: " + e.getMessage());
            fallback.setCorrectedSnippet("");
            return fallback;
        }
    }

    private CodeHintResponse parseHintResponse(String rawText) {
        try {
            String cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            JsonNode json = objectMapper.readTree(cleaned);

            List<String> hints = new ArrayList<>();
            JsonNode hintsNode = json.path("hints");
            if (hintsNode.isArray()) {
                for (JsonNode h : hintsNode) {
                    hints.add(h.asText());
                }
            }

            String summary = json.path("summary").asText("");
            String correctedSnippet = json.path("correctedSnippet").asText("");

            return new CodeHintResponse(hints, summary, correctedSnippet);

        } catch (Exception e) {
            logger.warn("Failed to parse structured response, returning raw text: {}", e.getMessage());
            CodeHintResponse fallback = new CodeHintResponse();
            fallback.setHints(List.of(rawText));
            fallback.setSummary("Raw AI response (could not parse structured format)");
            fallback.setCorrectedSnippet("");
            return fallback;
        }
    }
}
