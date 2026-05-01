package com.shivsharan.backend.controller;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shivsharan.backend.Auth.CustomUserDetails;
import com.shivsharan.backend.DTO.SubmissionDTO;
import com.shivsharan.backend.DTO.SubmissionResponse;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.ContestRepository;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.SubmissionRepository;
import com.shivsharan.backend.repository.UserRepository;
import com.shivsharan.backend.service.JobQueueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProblemSubmitController {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobQueueService jobQueueService;

    @Autowired
    private ContestRepository contestRepository; // For handling contest submissions

    /**
     * Submit code for a problem to be judged
     * @param submissionDTO Submission details (problemId, language, code)
     * @return Submission response with ID and status
     */
    @PostMapping("/submissions")
    @Transactional
    public ResponseEntity<SubmissionResponse> submit(@Valid @RequestBody SubmissionDTO submissionDTO) {
        // Get authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user;
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            // Re-fetch user from DB to avoid detached entity issues
            String username = customUserDetails.getUsername();
            user = userRepository.findByUsername(username).orElse(null);
        } else if (principal instanceof String username) {
            // JWT token stores username as principal
            user = userRepository.findByUsername(username).orElse(null);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Validate problem exists
        Optional<Problem> problemOpt = problemRepository.findById(submissionDTO.getProblemId());
        if (problemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Create and save submission
        Submission submission = createSubmission(submissionDTO, user);
        Submission saved = submissionRepository.saveAndFlush(submission);
        // Enqueue job for judging ONLY after successful commit
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    jobQueueService.enqueue(saved.getId());
                }
            });
        } else {
            jobQueueService.enqueue(saved.getId());
        }

        return ResponseEntity.accepted()
                .body(new SubmissionResponse(saved.getId(), saved.getStatus()));
    }

    /**
     * Get the status and details of a submission
     * @param submissionId Submission ID
     * @return Submission details
     */
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<Submission> getSubmission(@PathVariable UUID submissionId) {
        Optional<Submission> submission = submissionRepository.findById(submissionId);
        return submission.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get all submissions for the authenticated user
     * @return List of user's submissions
     */
    @GetMapping("/submissions/my")
    public ResponseEntity<List<Submission>> getMySubmissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = getUserFromAuth(auth);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Submission> submissions = submissionRepository.findByUser_IdOrderBySubmittedAtDesc(user.getId());
        return ResponseEntity.ok(submissions);
    }

    /**
     * Get all submissions for a specific problem
     * @param problemId Problem ID
     * @return List of submissions for the problem
     */
    @GetMapping("/problems/{problemId}/submissions")
    public ResponseEntity<List<Submission>> getProblemSubmissions(@PathVariable UUID problemId) {
        if (!problemRepository.existsById(problemId)) {
            return ResponseEntity.notFound().build();
        }
        List<Submission> submissions = submissionRepository.findByProblem_IdOrderBySubmittedAtDesc(problemId);
        return ResponseEntity.ok(submissions);
    }

    private User getUserFromAuth(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return userRepository.findByUsername(customUserDetails.getUsername()).orElse(null);
        } else if (principal instanceof String username) {
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private Submission createSubmission(SubmissionDTO dto, User user) {
        Problem problem = problemRepository.findById(dto.getProblemId())
                .orElseThrow(() -> new IllegalArgumentException("Problem not found"));
        
        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setLanguage(dto.getLanguage().toUpperCase());
        submission.setCode(dto.getCode());
        submission.setStatus(Verdict.PENDING);
        submission.setSubmittedAt(Instant.now());
        
        // If contestId is provided, link this submission to the contest
        if (dto.getContestId() != null) {
            contestRepository.findById(dto.getContestId()).ifPresent(submission::setContest);
        }
        
        return submission;
    }
}
