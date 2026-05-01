package com.shivsharan.backend.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shivsharan.backend.DTO.ProblemDTO;
import com.shivsharan.backend.DTO.TestCaseDTO;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.TestCase;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.TestCaseRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    /**
     * Create a new problem
     * @param problemDTO Problem details
     * @return Created problem
     */
    @PostMapping
    public ResponseEntity<Problem> createProblem(@Valid @RequestBody ProblemDTO problemDTO) {
        Problem problem = new Problem();
        problem.setTitle(problemDTO.getTitle());
        problem.setBody(problemDTO.getBody());
        problem.setDifficulty(problemDTO.getDifficulty());
        problem.setPoints(problemDTO.getPoints());
        problem.setTimeLimitMs(problemDTO.getTimeLimitMs());
        problem.setMemoryLimitMb(problemDTO.getMemoryLimitMb());
        problem.setCheckerType(problemDTO.getCheckerType());

        Problem savedProblem = problemRepository.save(problem);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProblem);
    }

    /**
     * Get all problems
     * @return List of all problems
     */
    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        List<Problem> problems = problemRepository.findAll();
        return ResponseEntity.ok(problems);
    }

    /**
     * Get a problem by ID
     * @param problemId Problem ID (UUID)
     * @return Problem details
     */
    @GetMapping("/{problemId}")
    public ResponseEntity<Problem> getProblem(@PathVariable UUID problemId) {
        Optional<Problem> problem = problemRepository.findById(problemId);
        return problem.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update a problem
     * @param problemId Problem ID to update
     * @param problemDTO Updated problem details
     * @return Updated problem
     */
    @PutMapping("/{problemId}")
    public ResponseEntity<Problem> updateProblem(
            @PathVariable UUID problemId,
            @Valid @RequestBody ProblemDTO problemDTO) {
        Optional<Problem> problemOpt = problemRepository.findById(problemId);

        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem problem = problemOpt.get();
        problem.setTitle(problemDTO.getTitle());
        problem.setBody(problemDTO.getBody());
        problem.setDifficulty(problemDTO.getDifficulty());
        problem.setPoints(problemDTO.getPoints());
        problem.setTimeLimitMs(problemDTO.getTimeLimitMs());
        problem.setMemoryLimitMb(problemDTO.getMemoryLimitMb());
        problem.setCheckerType(problemDTO.getCheckerType());

        Problem updatedProblem = problemRepository.save(problem);
        return ResponseEntity.ok(updatedProblem);
    }

    /**
     * Delete a problem
     * @param problemId Problem ID to delete
     * @return No content response
     */
    @DeleteMapping("/{problemId}")
    public ResponseEntity<Void> deleteProblem(@PathVariable UUID problemId) {
        if (!problemRepository.existsById(problemId)) {
            return ResponseEntity.notFound().build();
        }

        // Delete associated test cases first
        testCaseRepository.deleteByProblem_Id(problemId);
        problemRepository.deleteById(problemId);

        return ResponseEntity.noContent().build();
    }

    /**
     * Add a test case to a problem
     * @param problemId Problem ID
     * @param testCaseDTO Test case details
     * @return Created test case
     */
    @PostMapping("/{problemId}/testcases")
    public ResponseEntity<TestCase> addTestCase(
            @PathVariable UUID problemId,
            @Valid @RequestBody TestCaseDTO testCaseDTO) {
        // Verify problem exists
        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TestCase testCase = new TestCase();
        testCase.setProblem(problemOpt.get());
        testCase.setInputPath(testCaseDTO.getInputPath());
        testCase.setOutputPath(testCaseDTO.getOutputPath());
        testCase.setPoints(testCaseDTO.getPoints());
        testCase.setIsSample(testCaseDTO.getIsSample());
        testCase.setOrdering(testCaseDTO.getOrdering());

        TestCase savedTestCase = testCaseRepository.save(testCase);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTestCase);
    }

    /**
     * Get all test cases for a problem
     * @param problemId Problem ID
     * @return List of test cases
     */
    @GetMapping("/{problemId}/testcases")
    public ResponseEntity<List<TestCase>> getTestCases(@PathVariable UUID problemId) {
        if (!problemRepository.existsById(problemId)) {
            return ResponseEntity.notFound().build();
        }

        List<TestCase> testCases = testCaseRepository.findByProblem_IdOrderByOrderingAsc(problemId);
        return ResponseEntity.ok(testCases);
    }

    /**
     * Delete a test case
     * @param problemId Problem ID
     * @param testCaseId Test case ID
     * @return No content response
     */
    @DeleteMapping("/{problemId}/testcases/{testCaseId}")
    public ResponseEntity<Void> deleteTestCase(
            @PathVariable UUID problemId,
            @PathVariable Long testCaseId) {
        Optional<TestCase> testCaseOpt = testCaseRepository.findById(testCaseId);

        if (testCaseOpt.isEmpty() || !testCaseOpt.get().getProblem().getId().equals(problemId)) {
            return ResponseEntity.notFound().build();
        }

        testCaseRepository.deleteById(testCaseId);
        return ResponseEntity.noContent().build();
    }
}
