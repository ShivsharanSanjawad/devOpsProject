package com.shivsharan.backend.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.SubmissionRepository;

import jakarta.validation.constraints.NotBlank;

@Service
public class SubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    /**
     * Create and save a new submission
     * @param problemId Problem ID (UUID)
     * @param language Programming language
     * @param code Source code
     * @return Created submission
     */
    public Submission createAndSave(@NotBlank String problemId,
                                    @NotBlank String language,
                                    @NotBlank String code) {
        UUID problemUuid = UUID.fromString(problemId);
        Problem problem = problemRepository.findById(problemUuid)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + problemId));

        UUID id = UUID.randomUUID();
        Submission s = new Submission();
        s.setId(id);
        s.setProblem(problem);
        s.setLanguage(language.toUpperCase());
        s.setCode(code);
        s.setStatus(Verdict.PENDING);
        s.setSubmittedAt(Instant.now());
        
        Submission saved = submissionRepository.save(s);
        logger.info("Created submission {} for problem {}", id, problemId);
        return saved;
    }

    /**
     * Find a submission by ID
     * @param id Submission ID
     * @return Submission if found
     */
    public Optional<Submission> findById(String id) {
        return submissionRepository.findById(UUID.fromString(id));
    }

    /**
     * Get submission by ID
     * @param id Submission ID
     * @return Submission details
     * @throws Exception if submission not found
     */
    public Submission getById(String id) throws Exception {
        return submissionRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new Exception("Submission not found: " + id));
    }
}
