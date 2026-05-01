package com.shivsharan.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shivsharan.backend.service.JudgeService;

import java.util.UUID;

/**
 * Debug controller for manual submission judging and testing
 */
@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);

    @Autowired
    private JudgeService judgeService;

    /**
     * Manually trigger judging for a submission (for testing)
     * @param id Submission ID
     * @return Response indicating judge was invoked
     */
    @PostMapping("/judge")
    public ResponseEntity<String> judgeNow(@RequestParam UUID id) {
        logger.info("Debug: Triggering judge for submission {}", id);
        try {
            judgeService.judge(id);
            return ResponseEntity.ok("Judge invoked for submission: " + id);
        } catch (Exception e) {
            logger.error("Debug: Error judging submission {}", id, e);
            return ResponseEntity.internalServerError()
                    .body("Error judging submission: " + e.getMessage());
        }
    }
}
