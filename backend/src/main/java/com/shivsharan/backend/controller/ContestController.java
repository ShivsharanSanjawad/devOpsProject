package com.shivsharan.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shivsharan.backend.DTO.ContestDetailDTO;
import com.shivsharan.backend.DTO.ContestListDTO;
import com.shivsharan.backend.DTO.ContestSubmitRequest;
import com.shivsharan.backend.DTO.CreateContestRequest;
import com.shivsharan.backend.DTO.LeaderboardDTO;
import com.shivsharan.backend.model.Contest;
import com.shivsharan.backend.model.ContestProblem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.ContestParticipantRepository;
import com.shivsharan.backend.repository.UserRepository;
import com.shivsharan.backend.service.ContestService;

@RestController
@RequestMapping("/api/contests")
@CrossOrigin(origins = "*")
public class ContestController {

    @Autowired
    private ContestService contestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContestParticipantRepository participantRepository;

    /**
     * GET /api/contests - List all contests
     * Query param: status=upcoming|ongoing|past|all (default: all)
     */
    @GetMapping
    public ResponseEntity<List<ContestListDTO>> getAllContests(
            @RequestParam(required = false, defaultValue = "all") String status) {
        
        List<ContestListDTO> contests;
        switch (status.toLowerCase()) {
            case "upcoming":
                contests = contestService.getUpcomingContests();
                break;
            case "ongoing":
                contests = contestService.getOngoingContests();
                break;
            case "past":
                contests = contestService.getPastContests();
                break;
            default:
                contests = contestService.getAllContests();
        }
        return ResponseEntity.ok(contests);
    }

    /**
     * GET /api/contests/my-registrations - Get contest IDs the current user is registered for
     */
    @GetMapping("/my-registrations")
    public ResponseEntity<?> getMyRegistrations() {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<UUID> contestIds = participantRepository.findByUser_Id(userId).stream()
                .map(cp -> cp.getContest().getId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(contestIds);
    }

    /**
     * GET /api/contests/{id} - Get contest details with problems
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContestDetailDTO> getContestDetail(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        ContestDetailDTO detail = contestService.getContestDetail(id, userId);
        return ResponseEntity.ok(detail);
    }

    /**
     * POST /api/contests - Create new contest (Admin only)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createContest(@RequestBody CreateContestRequest request) {
        Contest contest = contestService.createContest(request);
        Map<String, Object> response = new HashMap<>();
        response.put("id", contest.getId());
        response.put("title", contest.getTitle());
        response.put("message", "Contest created successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/contests/{id} - Update contest (Admin only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateContest(
            @PathVariable UUID id,
            @RequestBody CreateContestRequest request) {
        Contest contest = contestService.updateContest(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("id", contest.getId());
        response.put("message", "Contest updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/contests/{id} - Delete contest (Admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteContest(@PathVariable UUID id) {
        contestService.deleteContest(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contest deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/contests/{id}/register - Register for contest
     */
    @PostMapping("/{id}/register")
    public ResponseEntity<Map<String, Object>> registerForContest(@PathVariable UUID id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            contestService.registerForContest(id, user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully registered for contest");
            response.put("contestId", id);
            response.put("userId", user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/contests/{id}/submit - Submit solution during contest
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitToContest(
            @PathVariable UUID id,
            @RequestBody ContestSubmitRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            Submission submission = contestService.submitToContest(id, user, request);
            Map<String, Object> response = new HashMap<>();
            response.put("submissionId", submission.getId());
            response.put("status", submission.getStatus().name());
            response.put("message", "Submission queued for judging");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/contests/{id}/my-submissions - Get user's contest submissions
     */
    @GetMapping("/{id}/my-submissions")
    public ResponseEntity<?> getMyContestSubmissions(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        List<Submission> submissions = contestService.getMyContestSubmissions(id, userId);
        List<Map<String, Object>> response = submissions.stream().map(sub -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sub.getId());
            map.put("problemId", sub.getProblem().getId());
            map.put("problemTitle", sub.getProblem().getTitle());
            map.put("language", sub.getLanguage());
            map.put("status", sub.getStatus().name());
            map.put("timeMs", sub.getTimeMs());
            map.put("memoryKb", sub.getMemoryKb());
            map.put("submittedAt", sub.getSubmittedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/contests/{id}/leaderboard - Get contest leaderboard
     */
    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<LeaderboardDTO> getLeaderboard(@PathVariable UUID id) {
        LeaderboardDTO leaderboard = contestService.getLeaderboard(id);
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * POST /api/contests/{id}/problems - Add problem to contest (Admin only)
     */
    @PostMapping("/{id}/problems")
    public ResponseEntity<Map<String, Object>> addProblemToContest(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        UUID problemId = UUID.fromString((String) request.get("problemId"));
        Integer displayOrder = (Integer) request.get("displayOrder");

        ContestProblem cp = contestService.addProblemToContest(id, problemId, displayOrder);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", cp.getId());
        response.put("message", "Problem added to contest");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/contests/{id}/problems/{problemId} - Remove problem from contest (Admin only)
     */
    @DeleteMapping("/{id}/problems/{contestProblemId}")
    public ResponseEntity<Map<String, String>> removeProblemFromContest(
            @PathVariable UUID id,
            @PathVariable Long contestProblemId) {
        contestService.removeProblemFromContest(contestProblemId);
        return ResponseEntity.ok(Map.of("message", "Problem removed from contest"));
    }

    // Helper methods
    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElse(null);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
