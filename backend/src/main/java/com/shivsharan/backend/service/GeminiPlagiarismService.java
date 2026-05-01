package com.shivsharan.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.shivsharan.backend.DTO.PlagiarismCheckRequest;
import com.shivsharan.backend.DTO.PlagiarismCheckResponse;

@Service
public class GeminiPlagiarismService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiPlagiarismService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Client client;
    private final String model;

    private final String promptTemplate = """
            You are an expert code plagiarism and AI-detection analyst. Analyze the following code submission and determine whether it appears to be:
            1. Original (written by a human student)
            2. AI-generated (written by ChatGPT, Copilot, Gemini, or similar LLMs)
            3. Plagiarised (copied from common online sources, tutorials, or another student)
            
            ### LANGUAGE
            %s
            
            ### PROBLEM STATEMENT (if provided)
            %s
            
            ### SUBMITTED CODE
            ```
            %s
            ```
            
            ### ANALYSIS CRITERIA
            Evaluate the code on these signals:
            
            **AI-Generated Indicators:**
            - Overly verbose or perfectly structured comments
            - Unusually consistent naming conventions throughout
            - Textbook-perfect code structure that's too clean for a student
            - Generic variable names like "result", "temp", "output" used systematically
            - Boilerplate patterns typical of LLM outputs
            - Explanatory comments that read like documentation
            - Perfect error handling that students rarely write
            - Code that solves the problem in the most "standard" way possible
            
            **Plagiarism Indicators:**
            - Code that matches well-known tutorial patterns exactly
            - Inconsistent coding style (suggesting copy-paste from multiple sources)
            - Unusual variable names that don't match the problem context
            - Code that is overly complex for the problem (grabbed from a more advanced source)
            - Leftover comments or code artifacts from another context
            
            **Original Code Indicators:**
            - Natural coding style with minor inconsistencies
            - Personal variable naming choices
            - Some inefficiencies or non-optimal approaches
            - Comments that reflect personal understanding (or no comments at all)
            - Incremental problem-solving approach visible in code structure
            - Minor style variations typical of human writing
            
            ### OUTPUT FORMAT
            Return ONLY valid JSON with no markdown formatting:
            {
              "verdict": "LIKELY_ORIGINAL" | "SUSPICIOUS" | "LIKELY_AI_GENERATED" | "LIKELY_PLAGIARISED",
              "originalityScore": 0-100,
              "aiLikelihood": 0-100,
              "indicators": ["indicator1", "indicator2", ...],
              "explanation": "Detailed 2-3 sentence explanation of the analysis",
              "recommendation": "What the reviewer should do next"
            }
            """;

    public GeminiPlagiarismService(@Value("${gemini.api.key}") String apiKey,
                                   @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.model = model;
    }

    public PlagiarismCheckResponse checkPlagiarism(PlagiarismCheckRequest request) {
        String language = (request.getLanguage() != null) ? request.getLanguage() : "unknown";
        String code = (request.getCode() != null) ? request.getCode() : "";
        String problemStatement = (request.getProblemStatement() != null) ? request.getProblemStatement() : "Not provided";

        String prompt = String.format(promptTemplate, language, problemStatement, code);
        logger.info("Sending plagiarism check request to Gemini for language: {}", language);

        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            String rawText = response.text();
            logger.info("Gemini plagiarism response received, length: {}", rawText != null ? rawText.length() : 0);
            return parseResponse(rawText);
        } catch (Exception e) {
            logger.error("Gemini plagiarism check failed: {}", e.getMessage(), e);
            return fallbackResponse(e.getMessage());
        }
    }

    private PlagiarismCheckResponse parseResponse(String rawText) {
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

            String verdict = json.path("verdict").asText("SUSPICIOUS");
            int originalityScore = json.path("originalityScore").asInt(50);
            int aiLikelihood = json.path("aiLikelihood").asInt(50);

            List<String> indicators = new ArrayList<>();
            JsonNode indicatorsNode = json.path("indicators");
            if (indicatorsNode.isArray()) {
                for (JsonNode ind : indicatorsNode) {
                    indicators.add(ind.asText());
                }
            }

            String explanation = json.path("explanation").asText("");
            String recommendation = json.path("recommendation").asText("");

            return new PlagiarismCheckResponse(verdict, originalityScore, aiLikelihood, indicators, explanation, recommendation);

        } catch (Exception e) {
            logger.warn("Failed to parse plagiarism response: {}", e.getMessage());
            return fallbackResponse("Could not parse AI response");
        }
    }

    private PlagiarismCheckResponse fallbackResponse(String reason) {
        PlagiarismCheckResponse resp = new PlagiarismCheckResponse();
        resp.setVerdict("LIKELY_ORIGINAL");
        resp.setOriginalityScore(100);
        resp.setAiLikelihood(0);
        resp.setIndicators(List.of());
        // Don't expose raw API errors to the user
        if (reason != null && (reason.contains("403") || reason.contains("API Key") || reason.contains("unregistered"))) {
            resp.setExplanation("Plagiarism check is not configured. Set GEMINI_API_KEY to enable.");
        } else {
            resp.setExplanation("Plagiarism check service is temporarily unavailable. Your submission was judged normally.");
        }
        resp.setRecommendation("");
        return resp;
    }
}
