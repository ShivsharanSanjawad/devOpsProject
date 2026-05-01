package com.shivsharan.backend.controller;

import com.shivsharan.backend.DTO.PlagiarismCheckRequest;
import com.shivsharan.backend.DTO.PlagiarismCheckResponse;
import com.shivsharan.backend.service.GeminiPlagiarismService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PlagiarismController {

    private final GeminiPlagiarismService plagiarismService;

    public PlagiarismController(GeminiPlagiarismService plagiarismService) {
        this.plagiarismService = plagiarismService;
    }

    /**
     * POST /api/plagiarism-check
     * Analyze submitted code for AI-generation or plagiarism signals.
     */
    @PostMapping("/plagiarism-check")
    public ResponseEntity<PlagiarismCheckResponse> checkPlagiarism(
            @Valid @RequestBody PlagiarismCheckRequest request) {
        PlagiarismCheckResponse response = plagiarismService.checkPlagiarism(request);
        return ResponseEntity.ok(response);
    }
}
