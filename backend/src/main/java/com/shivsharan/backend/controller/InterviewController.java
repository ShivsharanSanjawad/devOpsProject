package com.shivsharan.backend.controller;

import com.shivsharan.backend.DTO.*;
import com.shivsharan.backend.service.GeminiInterviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final GeminiInterviewService geminiInterviewService;

    public InterviewController(GeminiInterviewService geminiInterviewService) {
        this.geminiInterviewService = geminiInterviewService;
    }

    /**
     * POST /api/interview/evaluate
     * Evaluate a candidate's answer to an interview question using Gemini.
     */
    @PostMapping("/evaluate")
    public ResponseEntity<InterviewEvalResponse> evaluateAnswer(
            @Valid @RequestBody InterviewEvalRequest request) {
        InterviewEvalResponse response = geminiInterviewService.evaluateAnswer(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/interview/questions
     * Generate interview questions for a given role using Gemini.
     */
    @PostMapping("/questions")
    public ResponseEntity<InterviewQuestionsResponse> generateQuestions(
            @RequestBody InterviewQuestionsRequest request) {
        InterviewQuestionsResponse response = geminiInterviewService.generateQuestions(request);
        return ResponseEntity.ok(response);
    }
}
