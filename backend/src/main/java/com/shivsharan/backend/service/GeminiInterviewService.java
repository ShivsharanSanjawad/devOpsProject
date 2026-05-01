package com.shivsharan.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.shivsharan.backend.DTO.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiInterviewService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiInterviewService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Client client;
    private final String model;

    // ── Evaluate an answer ──────────────────────────────────────────────
    private final String evalPromptTemplate = """
            You are an expert technical interviewer. Evaluate the candidate's answer to the following interview question.
            
            ### QUESTION
            %s
            
            ### DIFFICULTY
            %s
            
            ### EXPECTED TOPICS
            %s
            
            ### CANDIDATE'S ANSWER
            %s
            
            ### INSTRUCTIONS
            1. Score the answer on a scale of 1-10 for EACH of these metrics:
               - Technical: correctness and depth of technical knowledge
               - Communication: clarity, structure, and articulation
               - Depth: thoroughness and completeness of the answer
               - Relevance: how well the answer addresses the question and expected topics
            2. Compute an overall score (1-10) as a weighted average (Technical 35%%, Communication 25%%, Depth 25%%, Relevance 15%%).
            3. List key strengths (comma-separated, max 4 items).
            4. List areas for improvement (comma-separated, max 4 items).
            5. Provide 2-3 sentences of detailed feedback with actionable advice.
            
            ### OUTPUT FORMAT
            Return ONLY valid JSON with no markdown formatting:
            {
              "overall": 7,
              "metrics": [
                {"label": "Technical", "score": 7},
                {"label": "Communication", "score": 8},
                {"label": "Depth", "score": 6},
                {"label": "Relevance", "score": 7}
              ],
              "strengths": "Clear structure, Good use of examples",
              "improvements": "More depth on architecture, Mention trade-offs",
              "detailedFeedback": "Your answer showed a solid understanding of..."
            }
            """;

    // ── Generate interview questions ────────────────────────────────────
    private final String questionsPromptTemplate = """
            You are an expert technical interviewer. Generate %d interview questions for a %s role.
            Difficulty level: %s.
            
            ### INSTRUCTIONS
            1. Each question should test different aspects (e.g., fundamentals, system design, problem-solving, behavioral).
            2. For each question, assign a difficulty label ("Easy", "Medium", or "Hard") and 2-4 relevant topics.
            3. Questions should be realistic and commonly asked in top tech interviews.
            
            ### OUTPUT FORMAT
            Return ONLY valid JSON with no markdown formatting:
            {
              "questions": [
                {
                  "id": 1,
                  "difficulty": "Medium",
                  "text": "Explain the concept of...",
                  "topics": ["topic1", "topic2"]
                }
              ]
            }
            """;

    public GeminiInterviewService(@Value("${gemini.api.key}") String apiKey,
                                  @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.model = model;
    }

    // ── Public Methods ──────────────────────────────────────────────────

    public InterviewEvalResponse evaluateAnswer(InterviewEvalRequest request) {
        String question = request.getQuestion();
        String answer = request.getAnswer();
        String topics = (request.getTopics() != null) ? request.getTopics() : "general";
        String difficulty = (request.getDifficulty() != null) ? request.getDifficulty() : "Medium";

        String prompt = String.format(evalPromptTemplate, question, difficulty, topics, answer);
        logger.info("Sending interview evaluation request to Gemini");

        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            String rawText = response.text();
            logger.info("Gemini eval response received, length: {}", rawText != null ? rawText.length() : 0);
            return parseEvalResponse(rawText);
        } catch (Exception e) {
            logger.error("Gemini interview eval failed: {}", e.getMessage(), e);
            return fallbackEvalResponse(e.getMessage());
        }
    }

    public InterviewQuestionsResponse generateQuestions(InterviewQuestionsRequest request) {
        String role = (request.getRole() != null) ? request.getRole() : "Software Engineer";
        int count = (request.getCount() > 0) ? Math.min(request.getCount(), 10) : 5;
        String difficulty = (request.getDifficulty() != null) ? request.getDifficulty() : "Mixed";

        String prompt = String.format(questionsPromptTemplate, count, role, difficulty);
        logger.info("Generating {} interview questions for role: {}", count, role);

        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            String rawText = response.text();
            logger.info("Gemini questions response received, length: {}", rawText != null ? rawText.length() : 0);
            return parseQuestionsResponse(rawText);
        } catch (Exception e) {
            logger.error("Gemini question generation failed: {}", e.getMessage(), e);
            return fallbackQuestionsResponse();
        }
    }

    // ── Parsing Helpers ─────────────────────────────────────────────────

    private InterviewEvalResponse parseEvalResponse(String rawText) {
        try {
            String cleaned = cleanJson(rawText);
            JsonNode json = objectMapper.readTree(cleaned);

            int overall = json.path("overall").asInt(5);

            List<InterviewEvalResponse.Metric> metrics = new ArrayList<>();
            JsonNode metricsNode = json.path("metrics");
            if (metricsNode.isArray()) {
                for (JsonNode m : metricsNode) {
                    metrics.add(new InterviewEvalResponse.Metric(
                            m.path("label").asText("Unknown"),
                            m.path("score").asInt(5)
                    ));
                }
            }

            String strengths = json.path("strengths").asText("");
            String improvements = json.path("improvements").asText("");
            String detailedFeedback = json.path("detailedFeedback").asText("");

            return new InterviewEvalResponse(overall, metrics, strengths, improvements, detailedFeedback);

        } catch (Exception e) {
            logger.warn("Failed to parse eval response: {}", e.getMessage());
            return fallbackEvalResponse("Could not parse AI response");
        }
    }

    private InterviewQuestionsResponse parseQuestionsResponse(String rawText) {
        try {
            String cleaned = cleanJson(rawText);
            JsonNode json = objectMapper.readTree(cleaned);

            List<InterviewQuestionsResponse.InterviewQuestion> questions = new ArrayList<>();
            JsonNode questionsNode = json.path("questions");
            if (questionsNode.isArray()) {
                for (JsonNode q : questionsNode) {
                    List<String> topics = new ArrayList<>();
                    JsonNode topicsNode = q.path("topics");
                    if (topicsNode.isArray()) {
                        for (JsonNode t : topicsNode) {
                            topics.add(t.asText());
                        }
                    }
                    questions.add(new InterviewQuestionsResponse.InterviewQuestion(
                            q.path("id").asInt(),
                            q.path("difficulty").asText("Medium"),
                            q.path("text").asText(""),
                            topics
                    ));
                }
            }

            return new InterviewQuestionsResponse(questions);

        } catch (Exception e) {
            logger.warn("Failed to parse questions response: {}", e.getMessage());
            return fallbackQuestionsResponse();
        }
    }

    private String cleanJson(String rawText) {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private InterviewEvalResponse fallbackEvalResponse(String reason) {
        InterviewEvalResponse resp = new InterviewEvalResponse();
        resp.setOverall(0);
        resp.setMetrics(List.of(
                new InterviewEvalResponse.Metric("Technical", 0),
                new InterviewEvalResponse.Metric("Communication", 0),
                new InterviewEvalResponse.Metric("Depth", 0),
                new InterviewEvalResponse.Metric("Relevance", 0)
        ));
        resp.setStrengths("Evaluation unavailable");
        resp.setImprovements("Please try again later");
        resp.setDetailedFeedback("AI evaluation service is temporarily unavailable: " + reason);
        return resp;
    }

    private InterviewQuestionsResponse fallbackQuestionsResponse() {
        List<InterviewQuestionsResponse.InterviewQuestion> fallback = List.of(
                new InterviewQuestionsResponse.InterviewQuestion(1, "Medium",
                        "Tell me about your experience with software development. What technologies have you worked with?",
                        List.of("technical knowledge", "experience")),
                new InterviewQuestionsResponse.InterviewQuestion(2, "Hard",
                        "Explain the concept of system design. How would you design a URL shortener?",
                        List.of("system design", "architecture", "scalability"))
        );
        return new InterviewQuestionsResponse(fallback);
    }
}
