package com.shivsharan.backend.controller;

import com.shivsharan.backend.DTO.CodeHintRequest;
import com.shivsharan.backend.DTO.CodeHintResponse;
import com.shivsharan.backend.service.GeminiHintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GeminiHintController {

    private final GeminiHintService geminiHintService;

    public GeminiHintController(GeminiHintService geminiHintService) {
        this.geminiHintService = geminiHintService;
    }

    @PostMapping("/hints")
    public ResponseEntity<CodeHintResponse> getCodeHints(@Valid @RequestBody CodeHintRequest request) {
        CodeHintResponse response = geminiHintService.getHints(request);
        return ResponseEntity.ok(response);
    }
}
