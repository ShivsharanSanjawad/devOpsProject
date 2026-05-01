package com.shivsharan.backend.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shivsharan.backend.Auth.CustomUserDetails;
import com.shivsharan.backend.DTO.ProblemDetailDTO;
import com.shivsharan.backend.DTO.ProblemDetailDTO.ExampleTestCase;
import com.shivsharan.backend.DTO.ProblemDetailDTO.SolutionDTO;
import com.shivsharan.backend.DTO.ProblemDetailDTO.SubmissionSummary;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.ProblemSolution;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.TestCase;
import com.shivsharan.backend.model.Topic;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.ProblemSolutionRepository;
import com.shivsharan.backend.repository.SubmissionRepository;
import com.shivsharan.backend.repository.TestCaseRepository;
import com.shivsharan.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RestController
@RequestMapping("/api/problem")
public class ProblemDetailController {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemSolutionRepository problemSolutionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get detailed problem information for users
     * Includes: title, topics, acceptance rate, difficulty, solved status,
     * time/memory limits, description, examples, constraints, user's submissions, and solutions
     * 
     * @param problemId Problem UUID
     * @return Detailed problem information
     */
    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemDetailDTO> getProblemDetail(@PathVariable UUID problemId) {
        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem problem = problemOpt.get();
        User currentUser = getCurrentUser();

        // Build response
        ProblemDetailDTO detail = ProblemDetailDTO.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .topics(getTopicNames(problem))
                .acceptanceRate(calculateAcceptanceRate(problemId))
                .difficulty(problem.getDifficulty())
                .solvedByUser(hasUserSolved(currentUser, problemId))
                .timeLimitMs(problem.getTimeLimitMs() != null ? problem.getTimeLimitMs() : 2000)
                .memoryLimitMb(problem.getMemoryLimitMb() != null ? problem.getMemoryLimitMb() : 256)
                .description(problem.getBody())
                .examples(getSampleTestCases(problemId))
                .constraints(extractConstraints(problem))
                .points(problem.getPoints())
                .mySubmissions(getUserSubmissions(currentUser, problemId))
                .solutions(getSolutions(problemId))
                .build();

        return ResponseEntity.ok(detail);
    }

    /**
     * Add a solution for a problem (admin endpoint)
     */
    @PostMapping("/{problemId}/solutions")
    public ResponseEntity<ProblemSolution> addSolution(
            @PathVariable UUID problemId,
            @Valid @RequestBody SolutionRequest request) {
        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if solution for this language already exists
        Optional<ProblemSolution> existing = problemSolutionRepository
                .findByProblem_IdAndLanguage(problemId, request.getLanguage().toUpperCase());
        
        ProblemSolution solution;
        if (existing.isPresent()) {
            solution = existing.get();
            solution.setCode(request.getCode());
            solution.setExplanation(request.getExplanation());
        } else {
            solution = ProblemSolution.builder()
                    .problem(problemOpt.get())
                    .language(request.getLanguage().toUpperCase())
                    .code(request.getCode())
                    .explanation(request.getExplanation())
                    .build();
        }

        ProblemSolution saved = problemSolutionRepository.save(solution);
        return ResponseEntity.ok(saved);
    }

    // ============ Helper Methods ============

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return userRepository.findByUsername(customUserDetails.getUsername()).orElse(null);
        } else if (principal instanceof String username) {
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private List<String> getTopicNames(Problem problem) {
        if (problem.getTopics() == null || problem.getTopics().isEmpty()) {
            return List.of();
        }
        return problem.getTopics().stream()
                .map(Topic::getName)
                .collect(Collectors.toList());
    }

    /**
     * Calculate acceptance rate based on problemId hash (deterministic random)
     * Range: 30% - 85%
     */
    private Double calculateAcceptanceRate(UUID problemId) {
        // Use hash to generate consistent "random" rate
        int hash = Math.abs(problemId.hashCode());
        double rate = 30.0 + (hash % 5500) / 100.0; // 30.0 to 85.0
        return Math.round(rate * 10.0) / 10.0; // Round to 1 decimal
    }

    private Boolean hasUserSolved(User user, UUID problemId) {
        if (user == null) {
            return false;
        }
        List<UUID> solvedIds = submissionRepository.findSolvedProblemIds(user.getId(), Verdict.AC);
        return solvedIds.contains(problemId);
    }

    private List<ExampleTestCase> getSampleTestCases(UUID problemId) {
        List<TestCase> samples = testCaseRepository.findByProblem_IdAndIsSampleTrue(problemId);
        List<ExampleTestCase> examples = new ArrayList<>();

        for (TestCase tc : samples) {
            String input = readTestCaseContent(tc.getInputPath());
            String output = readTestCaseContent(tc.getOutputPath());
            
            examples.add(ExampleTestCase.builder()
                    .order(tc.getOrdering())
                    .input(input)
                    .output(output)
                    .build());
        }

        // Sort by ordering
        examples.sort((a, b) -> {
            if (a.getOrder() == null) return 1;
            if (b.getOrder() == null) return -1;
            return a.getOrder().compareTo(b.getOrder());
        });

        // Limit to 2 examples
        return examples.size() > 2 ? examples.subList(0, 2) : examples;
    }

    private String readTestCaseContent(String path) {
        if (path == null || path.isBlank()) {
            return "";
        }
        try {
            Path p = Path.of(path);
            if (Files.exists(p) && Files.isRegularFile(p)) {
                return Files.readString(p, StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            // Log error if needed
        }
        // If path is content itself (not a file path)
        if (!path.contains("/") && !path.contains("\\")) {
            return path;
        }
        return "";
    }

    private String extractConstraints(Problem problem) {
        // Try to extract constraints from body/description
        String body = problem.getBody();
        if (body == null) {
            return buildDefaultConstraints(problem);
        }

        // Look for constraints section in markdown
        String lowerBody = body.toLowerCase();
        int constraintsIdx = lowerBody.indexOf("### constraints");
        if (constraintsIdx == -1) {
            constraintsIdx = lowerBody.indexOf("## constraints");
        }
        if (constraintsIdx == -1) {
            constraintsIdx = lowerBody.indexOf("**constraints");
        }

        if (constraintsIdx != -1) {
            // Extract text after constraints header until next section or end
            String afterConstraints = body.substring(constraintsIdx);
            int nextSection = findNextSection(afterConstraints);
            if (nextSection > 0) {
                return afterConstraints.substring(0, nextSection).trim();
            }
            return afterConstraints.trim();
        }

        return buildDefaultConstraints(problem);
    }

    private int findNextSection(String text) {
        String[] markers = {"### ", "## ", "**Input", "**Output", "**Example"};
        int minIdx = Integer.MAX_VALUE;
        
        for (String marker : markers) {
            int idx = text.indexOf(marker, 10); // Skip the first few chars
            if (idx > 0 && idx < minIdx) {
                minIdx = idx;
            }
        }
        
        return minIdx == Integer.MAX_VALUE ? -1 : minIdx;
    }

    private String buildDefaultConstraints(Problem problem) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Constraints\n");
        sb.append("- Time Limit: ").append(problem.getTimeLimitMs() != null ? problem.getTimeLimitMs() : 2000).append(" ms\n");
        sb.append("- Memory Limit: ").append(problem.getMemoryLimitMb() != null ? problem.getMemoryLimitMb() : 256).append(" MB\n");
        return sb.toString();
    }

    private List<SubmissionSummary> getUserSubmissions(User user, UUID problemId) {
        if (user == null) {
            return List.of();
        }

        List<Submission> submissions = submissionRepository.findByUser_IdAndProblem_IdOrderBySubmittedAtDesc(user.getId(), problemId);
        
        return submissions.stream()
                .map(s -> SubmissionSummary.builder()
                        .id(s.getId())
                        .status(s.getStatus().name())
                        .language(s.getLanguage())
                        .timeMs(s.getTimeMs())
                        .memoryKb(s.getMemoryKb())
                        .submittedAt(s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    private Map<String, SolutionDTO> getSolutions(UUID problemId) {
        List<ProblemSolution> solutions = problemSolutionRepository.findByProblem_Id(problemId);
        Map<String, SolutionDTO> solutionMap = new HashMap<>();

        for (ProblemSolution sol : solutions) {
            solutionMap.put(sol.getLanguage().toLowerCase(), SolutionDTO.builder()
                    .language(sol.getLanguage())
                    .code(sol.getCode())
                    .explanation(sol.getExplanation())
                    .build());
        }

        return solutionMap;
    }

    // ============ Request DTOs ============

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolutionRequest {
        private String language;
        private String code;
        private String explanation;
    }
}
