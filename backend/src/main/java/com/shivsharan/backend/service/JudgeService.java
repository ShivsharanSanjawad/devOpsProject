package com.shivsharan.backend.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shivsharan.backend.DTO.PlagiarismCheckRequest;
import com.shivsharan.backend.DTO.PlagiarismCheckResponse;
import com.shivsharan.backend.enums.CheckerType;
import com.shivsharan.backend.enums.Language;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.judge.TestCaseResult;
import com.shivsharan.backend.model.Contest;
import com.shivsharan.backend.model.ContestParticipant;
import com.shivsharan.backend.model.ContestParticipantId;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.TestCase;
import com.shivsharan.backend.repository.ContestParticipantRepository;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.SubmissionRepository;
import com.shivsharan.backend.repository.TestCaseRepository;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class JudgeService {

    private static final Logger logger = LoggerFactory.getLogger(JudgeService.class);
    private static final String BASE_NAME = "devhacks-sandbox";
    private volatile String activeContainerName = BASE_NAME + "-persistent";
    private volatile boolean sandboxReady = false;
    private volatile String sandboxError = null;
    private final Object sandboxLock = new Object();

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private ContestParticipantRepository contestParticipantRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BattleService battleService;

    // Self-injection to allow @Transactional to work on internal calls
    @Autowired
    @org.springframework.context.annotation.Lazy
    private JudgeService self;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GeminiPlagiarismService plagiarismService;

    @PostConstruct
    public void startSandbox() {
        CompletableFuture.runAsync(() -> {
            synchronized (sandboxLock) {
                logger.info("Universal Sandbox Discovery starting...");
                sandboxReady = false;
                sandboxError = null;
                
                try {
                    // 0. Verify Docker is working and image exists
                    logger.info("Verifying Docker daemon and sandbox image...");
                    ExecResult dockerCheckRes = runCommand(List.of("docker", "version"), 5000L);
                    if (dockerCheckRes.exitCode != 0) {
                        throw new Exception("Docker daemon not responding: " + dockerCheckRes.stdout);
                    }
                    
                    ExecResult imageCheckRes = runCommand(List.of("docker", "images", "-q", BASE_NAME), 5000L);
                    if (imageCheckRes.exitCode != 0 || imageCheckRes.stdout.trim().isEmpty()) {
                        throw new Exception("Sandbox image '" + BASE_NAME + "' not found. Run: ./sandbox/build-sandbox.ps1");
                    }
                    logger.info("Docker and sandbox image verified successfully");
                    
                    // 1. Try to find ANY running container from our image
                    ExecResult findRes = runCommand(List.of("docker", "ps", "--filter", "ancestor=" + BASE_NAME, 
                            "--filter", "status=running", "--format", "{{.Names}}"), 10000L);
                    
                    if (findRes.exitCode == 0 && !findRes.stdout.isBlank()) {
                        String[] existingNames = findRes.stdout.split("\\n");
                        for (String name : existingNames) {
                            name = name.trim();
                            if (name.isEmpty()) continue;
                            
                            logger.info("Found potential sandbox: {}. checking health...", name);
                            ExecResult readyRes = runCommand(List.of("docker", "exec", name, "echo", "ready"), 5000L);
                            if (readyRes.exitCode == 0) {
                                activeContainerName = name;
                                sandboxReady = true;
                                sandboxError = null;
                                logger.info("Successfully re-linked to healthy sandbox: {}", activeContainerName);
                                return;
                            }
                        }
                    }

                    // 2. If no healthy container found, start a new one
                    String uniqueSuffix = String.valueOf(System.currentTimeMillis() % 10000);
                    String newName = BASE_NAME + "-session-" + uniqueSuffix;

                    logger.info("Starting fresh session container: {}", newName);
                    
                    // Detect execution environment to choose correct Docker flags
                    String osName = System.getProperty("os.name", "").toLowerCase();
                    boolean isWindows = osName.contains("win");
                    boolean isInsideDocker = new java.io.File("/.dockerenv").exists();
                    
                    List<String> dockerCmd = new ArrayList<>(List.of("docker", "run", "-d",
                            "--name", newName,
                            "--network", "none",
                            "--memory", "2g",
                            "--cpus", "2.0"));
                    
                    // --cgroupns host only works on bare-metal Linux, not in Docker-in-Docker or Windows
                    if (!isWindows && !isInsideDocker) {
                        dockerCmd.add("--cgroupns");
                        dockerCmd.add("host");
                    }
                    
                    // Seccomp profile only on bare-metal Linux (not Windows, not Docker-in-Docker)
                    if (!isWindows && !isInsideDocker) {
                        String seccompPath = new java.io.File("sandbox/seccomp.json").getAbsolutePath();
                        dockerCmd.add("--security-opt");
                        dockerCmd.add("seccomp=" + seccompPath);
                    }
                    
                    dockerCmd.add(BASE_NAME);
                    dockerCmd.add("sleep");
                    dockerCmd.add("infinity");
                    
                    ExecResult runRes = runCommand(dockerCmd, 60000L); // 60s for Windows Docker start

                    if (runRes.exitCode == 0) {
                        activeContainerName = newName;
                        sandboxReady = true;
                        sandboxError = null;
                        logger.info("Sandbox container {} initialized successfully. ID: {}", 
                                activeContainerName, runRes.stdout.trim());
                    } else {
                        String error = String.format("Failed to start sandbox container (exit code %d). Try restarting Docker.", runRes.exitCode);
                        sandboxError = error;
                        sandboxReady = false;
                        logger.error("{}. Output: {}", error, runRes.stdout.trim());
                    }
                } catch (Exception e) {
                    sandboxError = "Sandbox initialization failed: " + e.getMessage();
                    sandboxReady = false;
                    logger.error(sandboxError, e);
                }
            }
        });
    }

    @PreDestroy
    public void stopSandbox() {
        // Only clean up session containers we created, not the compose-managed persistent one
        if (activeContainerName != null && activeContainerName.contains("-session-")) {
            logger.info("Stopping sandbox session container: {}", activeContainerName);
            try {
                runCommand(List.of("docker", "kill", activeContainerName), 5000L);
                runCommand(List.of("docker", "rm", activeContainerName), 5000L);
            } catch (Exception e) {
                logger.error("Error stopping sandbox container", e);
            }
        } else {
            logger.info("Skipping cleanup of externally-managed sandbox: {}", activeContainerName);
        }
    }

    /**
     * Entry point for judging. Handles lookup retries outside of a transaction 
     * to ensure data visibility.
     */
    public void judge(UUID submissionId) {
        logger.info("Submission judging request received: {}", submissionId);
        
        // 1. Find submission with retries OUTSIDE of a transaction
        Submission sub = null;
        for (int i = 0; i < 10; i++) { // Increased retries
            Optional<Submission> opt = submissionRepository.findById(submissionId);
            if (opt.isPresent()) {
                sub = opt.get();
                break;
            }
            try {
                logger.info("Submission {} not found yet, retrying in 500ms (attempt {}/10)...", submissionId, i + 1);
                TimeUnit.MILLISECONDS.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }

        if (sub == null) {
            logger.error("Submission [{}] not found after 10 retries. Aborting.", submissionId);
            return;
        }

        // 2. Delegate to transactional method via proxy (self-injection)
        try {
            self.performJudging(sub);
        } catch (Exception e) {
            logger.error("Internal error during judging for {}", submissionId, e);
        }
    }

    /**
     * The actual judging logic, isolated in its own transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void performJudging(Submission sub) {
        UUID submissionId = sub.getId();
        logger.info("Starting judging transaction for: {}", submissionId);
        
        // Refresh/Lock submission in this transaction
        sub = submissionRepository.findById(submissionId).orElseThrow();
        
        sub.setStatus(Verdict.RUNNING);
        sub = submissionRepository.save(sub);

        Problem problem = sub.getProblem();
        if (problem == null) {
            logger.warn("Problem not found for submission: {}", submissionId);
            sub.setStatus(Verdict.RE);
            sub.setJudgedAt(Instant.now());
            submissionRepository.save(sub);
            notificationService.notifyUser(sub);
            return;
        }

        List<TestCase> testCases = testCaseRepository.findByProblem_IdOrderByOrderingAsc(problem.getId());

        // ── AUTO PLAGIARISM CHECK (before Docker execution) ──
        try {
            logger.info("Running automatic plagiarism check for submission: {}", submissionId);
            PlagiarismCheckRequest plagReq = new PlagiarismCheckRequest(
                    sub.getCode(),
                    sub.getLanguage(),
                    problem.getTitle() != null ? problem.getTitle() : ""
            );
            PlagiarismCheckResponse plagRes = plagiarismService.checkPlagiarism(plagReq);
            sub.setPlagiarismVerdict(plagRes.getVerdict());
            sub.setOriginalityScore(plagRes.getOriginalityScore());
            sub.setAiLikelihood(plagRes.getAiLikelihood());
            sub.setPlagiarismExplanation(plagRes.getExplanation());

            // Apply penalty for AI-generated or plagiarised code
            if ("LIKELY_AI_GENERATED".equals(plagRes.getVerdict())
                    || "LIKELY_PLAGIARISED".equals(plagRes.getVerdict())) {
                sub.setPlagiarismPenalty(true);
                logger.warn("Plagiarism penalty applied for submission: {} — verdict: {}", submissionId, plagRes.getVerdict());
            } else {
                sub.setPlagiarismPenalty(false);
            }
            sub = submissionRepository.save(sub);
        } catch (Exception plagEx) {
            logger.error("Plagiarism check failed for submission {} — continuing with judging", submissionId, plagEx);
            // Don't block judging if plagiarism check fails
        }

        Path workDir = null;
        List<TestCaseResult> results = new ArrayList<>();
        int maxTime = 0;
        int maxMemory = 0;
        String finalVerdict = Verdict.AC.name();

        // Ensure container is running (wait for readiness)
        logger.info("Verifying sandbox readiness for submission: {}", submissionId);
        
        // Check if sandbox startup failed critically
        if (sandboxError != null) {
            logger.error("Sandbox failed to initialize: {}", sandboxError);
            sub.setStatus(Verdict.RE);
            sub.setCompileError("Sandbox initialization failed: " + sandboxError);
            sub.setJudgedAt(Instant.now());
            submissionRepository.save(sub);
            notificationService.notifyUser(sub);
            return;
        }
        
        if (!waitForContainerReady(30)) {
            logger.error("Sandbox container is not ready after timeout. Aborting judge.");
            sub.setStatus(Verdict.RE);
            sub.setCompileError("Sandbox isolation environment failed to start (Timeout).");
            sub.setJudgedAt(Instant.now());
            submissionRepository.save(sub);
            notificationService.notifyUser(sub);
            return;
        }
        logger.info("Sandbox is ready. Proceeding with submission: {}", submissionId);

        // Unique username for this submission (must be valid Linux username: no dashes, max 32 chars)
        String username = "j" + submissionId.toString().replace("-", "").substring(0, 12);

        try {
            workDir = Files.createTempDirectory("judge-" + submissionId);

            Language lang;
            try {
                lang = Language.valueOf(sub.getLanguage().toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Unsupported language: {}", sub.getLanguage());
                sub.setStatus(Verdict.valueOf("PENDING_MANUAL"));
                submissionRepository.save(sub);
                notificationService.notifyUser(sub);
                return;
            }

            // 1. Prepare directory in container
            logger.info("Preparing directory in sandbox for user: {}", username);
            ExecResult mkdirRes = dockerExec(List.of("mkdir", "-p", "/home/" + username), 10000L);
            if (mkdirRes.exitCode != 0) {
                throw new Exception("Failed to create directory in sandbox: " + mkdirRes.stderr);
            }

            // 2. Compile
            logger.info("Compiling submission: {} for language: {}", submissionId, lang);
            CompileResult compileResult = compile(lang, workDir, sub.getCode(), username);
            if (!compileResult.isSuccess()) {
                logger.info("Compilation failed for submission: {}", submissionId);
                sub.setStatus(Verdict.CE);
                sub.setCompileError(compileResult.getError());
                sub.setJudgedAt(Instant.now());
                submissionRepository.save(sub);
                notificationService.notifyUser(sub);
                // Cleanup
                cleanupSubmission(username);
                return;
            }

            // 3. Run each test case
            int tcCount = 0;
            for (TestCase tc : testCases) {
                tcCount++;
                logger.info("Running test case {}/{} (ID: {}) for submission: {}", 
                        tcCount, testCases.size(), tc.getId(), submissionId);
                TestCaseResult tcr = runTestCaseInSandbox(lang, workDir, tc, problem.getTimeLimitMs(),
                        problem.getMemoryLimitMb(), problem.getCheckerType(), username);
                results.add(tcr);
                if (tcr.getTimeMs() != null) {
                    maxTime = Math.max(maxTime, tcr.getTimeMs());
                }
                if (tcr.getMemoryKb() != null) {
                    maxMemory = Math.max(maxMemory, tcr.getMemoryKb());
                }

                if (!Verdict.AC.name().equals(tcr.getVerdict())) {
                    finalVerdict = tcr.getVerdict();
                    logger.info("Test case {} failed with verdict: {}", tc.getId(), finalVerdict);
                    break; // stop on first failure (ACM style)
                }
            }

            sub.setStatus(Verdict.valueOf(finalVerdict));
            sub.setTimeMs(maxTime);
            sub.setMemoryKb(maxMemory);
            sub.setVerdictDetail(objectMapper.writeValueAsString(results));
            sub.setJudgedAt(Instant.now());
            submissionRepository.save(sub);
            logger.info("Submission {} judged with verdict: {}", submissionId, finalVerdict);

            // Update contest participant score if this is a contest submission with AC verdict
            if (Verdict.AC.name().equals(finalVerdict) && sub.getContest() != null) {
                updateContestParticipantScore(sub);
            }

        } catch (Exception e) {
            logger.error("Error during judging submission {}", submissionId, e);
            sub.setStatus(Verdict.RE);
            sub.setCompileError(e.getMessage());
            sub.setJudgedAt(Instant.now());
            submissionRepository.save(sub);
        } finally {
            cleanupSubmission(username);
            notificationService.notifyUser(sub);

            // Check if this submission is part of a 1v1 battle
            try {
                battleService.onSubmissionJudged(sub);
            } catch (Exception ex) {
                logger.debug("Battle check skipped: {}", ex.getMessage());
            }

            if (workDir != null) {
                try {
                    FileUtils.deleteDirectory(workDir.toFile());
                } catch (IOException ignored) {
                }
            }
        }
    }

    /**
     * Update contest participant score after an AC submission
     */
    @Transactional(propagation = Propagation.REQUIRED)
    private void updateContestParticipantScore(Submission sub) {
        try {
            Contest contest = sub.getContest();
            if (contest == null) {
                logger.error("❌ Contest is null for submission {}", sub.getId());
                return;
            }
            
            UUID contestId = contest.getId();
            UUID userId = sub.getUser().getId();
            UUID problemId = sub.getProblem().getId();

            logger.info("💾 Updating contest participant score - Contest: {}, User: {}, Problem: {}", contestId, userId, problemId);

            // ENSURE participant is registered FIRST (before any early returns)
            Optional<ContestParticipant> optParticipant = contestParticipantRepository
                    .findByContest_IdAndUser_Id(contestId, userId);

            if (optParticipant.isEmpty()) {
                logger.warn("⚠️ Participant not found for contest {} and user {}, auto-registering...", contestId, userId);
                
                ContestParticipantId participantId = new ContestParticipantId(contestId, userId);
                ContestParticipant newParticipant = ContestParticipant.builder()
                        .id(participantId)
                        .contest(contest)
                        .user(sub.getUser())
                        .totalPoints(0)
                        .totalPenalty(0)
                        .isVirtual(false)
                        .build();
                
                ContestParticipant saved = contestParticipantRepository.save(newParticipant);
                contestParticipantRepository.flush();
                logger.info("✅ Auto-registered participant: user={}, contest={}", userId, contestId);
                
                optParticipant = Optional.of(saved);
            }
            
            // NOW check if this is the first AC
            List<Submission> previousAcSubmissions = submissionRepository
                    .findByContest_IdAndUser_IdAndProblem_Id(contestId, userId, problemId)
                    .stream()
                    .filter(s -> Verdict.AC.equals(s.getStatus()) && !s.getId().equals(sub.getId()))
                    .filter(s -> s.getSubmittedAt().isBefore(sub.getSubmittedAt()))
                    .toList();

            if (!previousAcSubmissions.isEmpty()) {
                logger.info("⚠️ Not first AC for problem {} in contest {}, skipping score update", problemId, contestId);
                return; // Not the first AC
            }

            ContestParticipant participant = optParticipant.get();
            Problem problem = sub.getProblem();

            // Calculate time from contest start to AC
            LocalDateTime acTime = LocalDateTime.ofInstant(sub.getSubmittedAt(), ZoneId.systemDefault());
            Duration duration = Duration.between(contest.getStartTime(), acTime);
            int timeMinutes = (int) duration.toMinutes();

            // Count wrong attempts before this AC
            long wrongAttempts = submissionRepository
                    .findByContest_IdAndUser_IdAndProblem_Id(contestId, userId, problemId)
                    .stream()
                    .filter(s -> !Verdict.AC.equals(s.getStatus()) && s.getSubmittedAt().isBefore(sub.getSubmittedAt()))
                    .count();

            // Penalty = time + 20 min per wrong submission
            int penalty = timeMinutes + ((int) wrongAttempts * 20);

            int oldPoints = participant.getTotalPoints() == null ? 0 : participant.getTotalPoints();
            int oldPenalty = participant.getTotalPenalty() == null ? 0 : participant.getTotalPenalty();

            participant.setTotalPoints(oldPoints + problem.getPoints());
            participant.setTotalPenalty(oldPenalty + penalty);
            participant.setLastAcTime(acTime);

            ContestParticipant saved = contestParticipantRepository.save(participant);
            logger.info("✅ Updated contest participant score: user={}, contest={}, oldPts={}, +{}pts (total={}), oldPen={}, +{}min (total={})", 
                    userId, contestId, oldPoints, problem.getPoints(), saved.getTotalPoints(), oldPenalty, penalty, saved.getTotalPenalty());

        } catch (Exception e) {
            logger.error("❌ Error updating contest participant score", e);
        }
    }

    private CompileResult compile(Language lang, Path workDir, String code, String username) throws Exception {
        switch (lang) {
            case PYTHON -> {
                Files.writeString(workDir.resolve("solution.py"), code, StandardCharsets.UTF_8);
                dockerCopy(workDir.resolve("solution.py"), "/home/" + username + "/solution.py");
                return CompileResult.success();
            }
            case JAVASCRIPT -> {
                Files.writeString(workDir.resolve("solution.js"), code, StandardCharsets.UTF_8);
                dockerCopy(workDir.resolve("solution.js"), "/home/" + username + "/solution.js");
                return CompileResult.success();
            }
            case CPP -> {
                Files.writeString(workDir.resolve("solution.cpp"), code, StandardCharsets.UTF_8);
                dockerCopy(workDir.resolve("solution.cpp"), "/home/" + username + "/solution.cpp");
                ExecResult res = dockerExec(List.of("g++", "-O2", "-std=c++17", "-o",
                        "/home/" + username + "/solution", "/home/" + username + "/solution.cpp"));
                return res.exitCode == 0 ? CompileResult.success() : CompileResult.failure(res.stdout + "\n" + res.stderr);
            }
            case JAVA -> {
                String userHome = "/home/" + username + "/";
                Files.writeString(workDir.resolve("Solution.java"), code, StandardCharsets.UTF_8);
                dockerCopy(workDir.resolve("Solution.java"), userHome + "Solution.java");
                // Specify output directory to be the same as source directory
                ExecResult res = dockerExec(List.of("javac", "-d", userHome, userHome + "Solution.java"));
                return res.exitCode == 0 ? CompileResult.success() : CompileResult.failure(res.stdout + "\n" + res.stderr);
            }
            default -> {
                logger.warn("Language {} not found in compile switch", lang);
                return CompileResult.success();
            }
        }
    }

    private TestCaseResult runTestCaseInSandbox(Language lang, Path workDir, TestCase tc, int timeLimitMs,
                                                int memoryLimitMb, String checkerTypeStr, String username) {
        Long tcId = tc.getId();
        Path localInput = null;
        String containerInput = "/home/" + username + "/input.txt";
        String containerOutput = "/home/" + username + "/output.txt";
        String containerError = "/home/" + username + "/error.txt";

        try {
            // Write input content to a temporary file for docker copy
            localInput = workDir.resolve("input-" + tcId + ".txt");
            String inputData = tc.getInputPath() != null ? tc.getInputPath() : "";
            
            // Check if inputData is a local file path (fix for seeded "sum" problem)
            if (!inputData.isBlank() && (inputData.contains("/") || inputData.contains("\\"))) {
                try {
                    Path p = Path.of(inputData);
                    if (Files.exists(p) && Files.isRegularFile(p)) {
                        inputData = Files.readString(p, StandardCharsets.UTF_8);
                    }
                } catch (Exception ignored) {
                    // Not a valid path or not readable, treat as literal
                }
            }
            Files.writeString(localInput, inputData, StandardCharsets.UTF_8);

            // Copy input into sandbox
            dockerCopy(localInput, containerInput);

            String runCmd = String.join(" ", getRunCommand(lang, username, memoryLimitMb));

            // Java needs extra memory for JVM overhead beyond heap size
            int sandboxMemoryMb = (lang == Language.JAVA) ? memoryLimitMb + 256 : memoryLimitMb;

            // Execute via run_isolated.sh
            ExecResult res = dockerExec(List.of("/usr/local/bin/run_isolated.sh",
                    username, lang.name().toLowerCase(),
                    String.valueOf(timeLimitMs), String.valueOf(sandboxMemoryMb),
                    runCmd));

            String log = res.stdout;
            String errOut = res.stderr;
            logger.info("Sandbox stdout: {}", log);
            logger.info("Sandbox stderr: {}", errOut);

            int exitCode = parseField(log, "EXIT");
            int timeMs = parseField(log, "TIME_MS");
            int memKb = parseField(log, "MEM_KB");

            if (exitCode == 124 || exitCode == 137) { // 124=timeout, 137=SIGKILL (possibly by cgroup)
                return new TestCaseResult(tcId, Verdict.TLE.name(), timeMs, memKb, "Time limit exceeded");
            }

            if (exitCode != 0) {
                // If exit code is non-zero, check if it was OOM
                if (memKb >= (long) memoryLimitMb * 1024) {
                     return new TestCaseResult(tcId, "MLE", timeMs, memKb, "Memory limit exceeded");
                }
                String err = readFromSandbox(containerError);
                if (err == null || err.isBlank()) {
                    err = "Runtime error (Exit code: " + exitCode + ")";
                }
                return new TestCaseResult(tcId, Verdict.RE.name(), timeMs, memKb, err);
            }

            String actual = readFromSandbox(containerOutput).strip();
            String expected = tc.getOutputPath() != null ? tc.getOutputPath() : "";

            // Check if expected is a local file path
            if (!expected.isBlank() && (expected.contains("/") || expected.contains("\\"))) {
                try {
                    Path p = Path.of(expected);
                    if (Files.exists(p) && Files.isRegularFile(p)) {
                        expected = Files.readString(p, StandardCharsets.UTF_8);
                    }
                } catch (Exception ignored) {
                    // Not a valid path or not readable, treat as literal
                }
            }
            expected = expected.strip();

            CheckerType checker = CheckerType.valueOf(
                    checkerTypeStr == null ? "EXACT" : checkerTypeStr.toUpperCase());
            boolean ok = checkOutput(actual, expected, checker);
            return new TestCaseResult(tcId, ok ? Verdict.AC.name() : Verdict.WA.name(), timeMs,
                    memKb, ok ? "" : "Output mismatch");

        } catch (Exception e) {
            logger.error("Error running test case {} in sandbox", tcId, e);
            return new TestCaseResult(tcId, Verdict.RE.name(), 0, null, e.getMessage());
        }
    }

    private ExecResult dockerExec(List<String> cmd) throws Exception {
        return dockerExec(cmd, 30000L); // default 30s for non-judging commands
    }

    private ExecResult dockerExec(List<String> cmd, long timeoutMs) throws Exception {
        List<String> fullCmd = new ArrayList<>();
        fullCmd.add("docker");
        fullCmd.add("exec");
        fullCmd.add(activeContainerName);
        fullCmd.addAll(cmd);
        return runCommand(fullCmd, timeoutMs);
    }

    private void dockerCopy(Path source, String dest) throws Exception {
        ExecResult res = runCommand(List.of("docker", "cp", source.toString(), activeContainerName + ":" + dest), 10000L);
        if (res.exitCode != 0) {
            throw new IOException("Docker copy failed: " + res.stdout);
        }
    }

    private String readFromSandbox(String path) throws Exception {
        ExecResult res = dockerExec(List.of("cat", path), 5000L);
        if (res.exitCode != 0) {
            logger.warn("Failed to read from sandbox: {} (exit {})", path, res.exitCode);
        }
        return res.stdout;
    }

    private boolean waitForContainerReady(int timeoutSeconds) {
        long start = System.currentTimeMillis();
        long timeout = timeoutSeconds * 1000L;
        
        while (System.currentTimeMillis() - start < timeout) {
            // If sandbox error is set, we failed catastrophically
            if (sandboxError != null) {
                logger.error("Sandbox startup failed: {}", sandboxError);
                return false;
            }
            
            // If sandbox is ready, verify it still works
            if (sandboxReady && isContainerRunning()) {
                try {
                    ExecResult res = dockerExec(List.of("echo", "ready"), 2000L);
                    if (res.exitCode == 0) {
                        logger.info("Container verified ready");
                        return true;
                    }
                } catch (Exception e) {
                    logger.debug("Container health check failed: {}", e.getMessage());
                    sandboxReady = false; // Mark as not ready if health check fails
                }
            }
            
            // If not ready yet, wait a bit before retrying
            try {
                TimeUnit.MILLISECONDS.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        
        logger.error("Container still not ready after {} seconds. sandboxReady={}, sandboxError={}", 
                timeoutSeconds, sandboxReady, sandboxError);
        return false;
    }

    private boolean isContainerRunning() {
        ExecResult res = runCommand(List.of("docker", "inspect", "-f", "{{.State.Running}}", activeContainerName), 5000L);
        return "true".equalsIgnoreCase(res.stdout.trim());
    }

    private ExecResult runCommand(List<String> cmd, long timeoutMs) {
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process p = pb.start();

            StringBuilder output = new StringBuilder();
            
            // Read all output until EOF
            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
                
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // Wait for process to finish (should be quick since EOF reached)
            boolean finished = p.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                p.destroyForcibly();
                return new ExecResult(output.toString(), "Command timed out", 124);
            }

            return new ExecResult(output.toString(), "", p.exitValue());
        } catch (Exception e) {
            return new ExecResult("", e.getMessage(), -1);
        }
    }

    private void cleanupSubmission(String username) {
        try {
            dockerExec(List.of("bash", "-c", "userdel -r " + username + " 2>/dev/null; rm -rf /home/" + username));
        } catch (Exception e) {
            logger.warn("Failed to cleanup submission user {}: {}", username, e.getMessage());
        }
    }

    private int parseField(String output, String field) {
        return Pattern.compile("^" + field + "=(\\d+)", Pattern.MULTILINE)
                .matcher(output)
                .results()
                .map(m -> Integer.parseInt(m.group(1)))
                .findFirst().orElse(-1);
    }

    private boolean checkOutput(String actual, String expected, CheckerType checker) {
        switch (checker) {
            case EXACT -> {
                String a = actual.replaceAll("\\s+", " ").trim();
                String e = expected.replaceAll("\\s+", " ").trim();
                return a.equals(e);
            }
            case TOKEN -> {
                String[] at = actual.split("\\s+");
                String[] et = expected.split("\\s+");
                if (at.length != et.length) {
                    return false;
                }
                for (int i = 0; i < at.length; i++) {
                    if (!at[i].equals(et[i])) {
                        return false;
                    }
                }
                return true;
            }
            case FLOAT -> {
                double[] ad = parseDoubles(actual);
                double[] ed = parseDoubles(expected);
                if (ad.length != ed.length) {
                    return false;
                }
                for (int i = 0; i < ad.length; i++) {
                    double da = Math.abs(ad[i] - ed[i]);
                    if (da > 1e-6 && (ed[i] == 0 ? da > 1e-6 : da / Math.abs(ed[i]) > 1e-6)) {
                        return false;
                    }
                }
                return true;
            }
            default -> {
                return actual.equals(expected);
            }
        }
    }

    private double[] parseDoubles(String s) {
        List<Double> nums = new ArrayList<>();
        Matcher m = Pattern.compile("[+-]?(?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?")
                .matcher(s);
        while (m.find()) {
            nums.add(Double.parseDouble(m.group()));
        }
        double[] arr = new double[nums.size()];
        for (int i = 0; i < nums.size(); i++) {
            arr[i] = nums.get(i);
        }
        return arr;
    }

    private List<String> getRunCommand(Language lang, String username, int memoryLimitMb) {
        String base = "/home/" + username + "/";
        return switch (lang) {
            case PYTHON -> List.of("python3", base + "solution.py");
            case JAVASCRIPT -> List.of("node", base + "solution.js");
            case CPP -> List.of(base + "solution");
            case JAVA -> {
                // Use explicit heap size to work within cgroup constraints
                // Reserve memory for JVM overhead (metaspace, etc)
                int heapMb = Math.max(32, (int)(memoryLimitMb * 0.5));
                yield List.of("java", 
                    "-Xmx" + heapMb + "m",
                    "-Xms16m",
                    "-XX:MaxMetaspaceSize=32m",
                    "-XX:CompressedClassSpaceSize=16m",
                    "-XX:+UseSerialGC",
                    "-cp", base, "Solution");
            }
        };
    }

    private static class CompileResult {
        private final boolean success;
        private final String error;

        private CompileResult(boolean success, String error) {
            this.success = success;
            this.error = error;
        }

        public static CompileResult success() {
            return new CompileResult(true, null);
        }

        public static CompileResult failure(String err) {
            return new CompileResult(false, err);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getError() {
            return error;
        }
    }

    private static class ExecResult {
        String stdout;
        String stderr;
        int exitCode;
        ExecResult(String so, String se, int e) { stdout = so; stderr = se; exitCode = e; }
    }
}

