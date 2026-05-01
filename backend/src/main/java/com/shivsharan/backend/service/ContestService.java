package com.shivsharan.backend.service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shivsharan.backend.DTO.ContestDetailDTO;
import com.shivsharan.backend.DTO.ContestListDTO;
import com.shivsharan.backend.DTO.ContestSubmitRequest;
import com.shivsharan.backend.DTO.CreateContestRequest;
import com.shivsharan.backend.DTO.LeaderboardDTO;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Contest;
import com.shivsharan.backend.model.ContestParticipant;
import com.shivsharan.backend.model.ContestParticipantId;
import com.shivsharan.backend.model.ContestProblem;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.ContestParticipantRepository;
import com.shivsharan.backend.repository.ContestProblemRepository;
import com.shivsharan.backend.repository.ContestRepository;
import com.shivsharan.backend.repository.ProblemRepository;
import com.shivsharan.backend.repository.SubmissionRepository;
import com.shivsharan.backend.repository.UserRepository;

@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ContestProblemRepository contestProblemRepository;

    @Autowired
    private ContestParticipantRepository participantRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobQueueService jobQueueService;

    /**
     * Get all contests with status
     */
    public List<ContestListDTO> getAllContests() {
        List<Contest> contests = contestRepository.findAllByOrderByStartTimeDesc();
        return contests.stream().map(this::toListDTO).collect(Collectors.toList());
    }

    /**
     * Get upcoming contests
     */
    public List<ContestListDTO> getUpcomingContests() {
        List<Contest> contests = contestRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now());
        return contests.stream().map(this::toListDTO).collect(Collectors.toList());
    }

    /**
     * Get ongoing contests
     */
    public List<ContestListDTO> getOngoingContests() {
        List<Contest> contests = contestRepository.findOngoingContests(LocalDateTime.now());
        return contests.stream().map(this::toListDTO).collect(Collectors.toList());
    }

    /**
     * Get past contests
     */
    public List<ContestListDTO> getPastContests() {
        List<Contest> contests = contestRepository.findByEndTimeBeforeOrderByEndTimeDesc(LocalDateTime.now());
        return contests.stream().map(this::toListDTO).collect(Collectors.toList());
    }

    /**
     * Get contest detail by ID — auto-registers the user as participant
     */
    @Transactional
    public ContestDetailDTO getContestDetail(UUID contestId, UUID userId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found: " + contestId));

        List<ContestProblem> contestProblems = contestProblemRepository.findByContest_IdOrderByDisplayOrderAsc(contestId);
        
        // Auto-register user if authenticated and not already registered
        boolean isRegistered = false;
        if (userId != null) {
            isRegistered = participantRepository.existsByContest_IdAndUser_Id(contestId, userId);
            if (!isRegistered) {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    ContestParticipantId pid = new ContestParticipantId(contestId, userId);
                    ContestParticipant cp = ContestParticipant.builder()
                            .id(pid)
                            .contest(contest)
                            .user(user)
                            .totalPoints(0)
                            .totalPenalty(0)
                            .isVirtual(false)
                            .build();
                    participantRepository.save(cp);
                    isRegistered = true;
                }
            }
        }

        Integer participantCount = participantRepository.countByContestId(contestId);

        List<ContestDetailDTO.ContestProblemDTO> problemDTOs = contestProblems.stream()
                .map(cp -> ContestDetailDTO.ContestProblemDTO.builder()
                        .order(cp.getDisplayOrder())
                        .problemId(cp.getProblem().getId())
                        .title(cp.getProblem().getTitle())
                        .difficulty(cp.getProblem().getDifficulty().name())
                        .points(cp.getProblem().getPoints())
                        .timeLimitMs(cp.getProblem().getTimeLimitMs())
                        .memoryLimitMb(cp.getProblem().getMemoryLimitMb())
                        .build())
                .collect(Collectors.toList());

        return ContestDetailDTO.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .status(getContestStatus(contest))
                .participantCount(participantCount)
                .isRegistered(isRegistered)
                .problems(problemDTOs)
                .build();
    }

    /**
     * Create a new contest (Admin only)
     */
    @Transactional
    public Contest createContest(CreateContestRequest request) {
        Contest contest = Contest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isVirtualEnabled(false)
                .build();

        Contest savedContest = contestRepository.save(contest);

        if (request.getProblems() != null) {
            for (CreateContestRequest.ContestProblemRequest problemReq : request.getProblems()) {
                Problem problem = problemRepository.findById(problemReq.getProblemId())
                        .orElseThrow(() -> new RuntimeException("Problem not found: " + problemReq.getProblemId()));

                ContestProblem cp = ContestProblem.builder()
                        .contest(savedContest)
                        .problem(problem)
                        .displayOrder(problemReq.getDisplayOrder())
                        .build();
                contestProblemRepository.save(cp);
            }
        }

        return savedContest;
    }

    /**
     * Update contest (Admin only)
     */
    @Transactional
    public Contest updateContest(UUID contestId, CreateContestRequest request) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found: " + contestId));

        contest.setTitle(request.getTitle());
        contest.setDescription(request.getDescription());
        contest.setStartTime(request.getStartTime());
        contest.setEndTime(request.getEndTime());

        return contestRepository.save(contest);
    }

    /**
     * Delete contest (Admin only)
     */
    @Transactional
    public void deleteContest(UUID contestId) {
        contestRepository.deleteById(contestId);
    }

    /**
     * Register user for contest
     */
    @Transactional
    public ContestParticipant registerForContest(UUID contestId, User user) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found: " + contestId));

        // Check if already registered
        if (participantRepository.existsByContest_IdAndUser_Id(contestId, user.getId())) {
            throw new RuntimeException("Already registered for this contest");
        }

        // Check if contest hasn't ended
        if (LocalDateTime.now().isAfter(contest.getEndTime())) {
            throw new RuntimeException("Contest has already ended");
        }

        ContestParticipantId participantId = new ContestParticipantId(contestId, user.getId());
        ContestParticipant participant = ContestParticipant.builder()
                .id(participantId)
                .contest(contest)
                .user(user)
                .totalPoints(0)
                .totalPenalty(0)
                .isVirtual(false)
                .build();

        return participantRepository.save(participant);
    }

    /**
     * Submit solution during contest
     */
    @Transactional
    public Submission submitToContest(UUID contestId, User user, ContestSubmitRequest request) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found: " + contestId));

        // Check if contest is ongoing
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(contest.getStartTime())) {
            throw new RuntimeException("Contest has not started yet");
        }
        if (now.isAfter(contest.getEndTime())) {
            throw new RuntimeException("Contest has ended");
        }

        // Auto-register user if not already registered
        if (!participantRepository.existsByContest_IdAndUser_Id(contestId, user.getId())) {
            ContestParticipantId pid = new ContestParticipantId(contestId, user.getId());
            ContestParticipant cp = ContestParticipant.builder()
                    .id(pid)
                    .contest(contest)
                    .user(user)
                    .totalPoints(0)
                    .totalPenalty(0)
                    .isVirtual(false)
                    .build();
            participantRepository.save(cp);
        }

        // Check if problem is part of contest
        List<ContestProblem> contestProblems = contestProblemRepository.findByContest_IdOrderByDisplayOrderAsc(contestId);
        boolean problemInContest = contestProblems.stream()
                .anyMatch(cp -> cp.getProblem().getId().equals(request.getProblemId()));
        if (!problemInContest) {
            throw new RuntimeException("Problem is not part of this contest");
        }

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        // Create submission (don't set ID manually - let JPA generate it)
        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setContest(contest);
        submission.setLanguage(request.getLanguage().toUpperCase());
        submission.setCode(request.getCode());
        submission.setStatus(Verdict.PENDING);
        submission.setSubmittedAt(Instant.now());

        Submission saved = submissionRepository.save(submission);
        submissionRepository.flush(); // Force flush to DB before enqueueing

        // Queue for judging after transaction commits
        final UUID submissionId = saved.getId();
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
            new org.springframework.transaction.support.TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    jobQueueService.enqueue(submissionId);
                }
            }
        );

        return saved;
    }

    /**
     * Get user's submissions in a contest
     */
    public List<Submission> getMyContestSubmissions(UUID contestId, UUID userId) {
        return submissionRepository.findByContest_IdAndUser_IdOrderBySubmittedAtDesc(contestId, userId);
    }

    /**
     * Get leaderboard for contest
     */
    public LeaderboardDTO getLeaderboard(UUID contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found: " + contestId));

        List<ContestParticipant> participants = participantRepository.findLeaderboard(contestId);
        List<ContestProblem> contestProblems = contestProblemRepository.findByContest_IdOrderByDisplayOrderAsc(contestId);

        List<LeaderboardDTO.LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;

        for (ContestParticipant participant : participants) {
            Map<UUID, LeaderboardDTO.ProblemStatus> problemStatuses = new HashMap<>();

            for (ContestProblem cp : contestProblems) {
                UUID problemId = cp.getProblem().getId();
                
                // Get first AC submission
                List<Submission> acSubmissions = submissionRepository.findFirstAcSubmission(
                        contestId, participant.getUser().getId(), problemId);
                
                Integer wrongAttempts = submissionRepository.countWrongAttempts(
                        contestId, participant.getUser().getId(), problemId);

                boolean solved = !acSubmissions.isEmpty();
                int timeMinutes = 0;
                int points = 0;

                if (solved) {
                    Submission firstAc = acSubmissions.get(0);
                    LocalDateTime acTime = LocalDateTime.ofInstant(firstAc.getSubmittedAt(), ZoneId.systemDefault());
                    Duration duration = Duration.between(contest.getStartTime(), acTime);
                    timeMinutes = (int) duration.toMinutes();
                    points = cp.getProblem().getPoints();
                }

                problemStatuses.put(problemId, LeaderboardDTO.ProblemStatus.builder()
                        .solved(solved)
                        .points(points)
                        .attempts(wrongAttempts + (solved ? 1 : 0))
                        .timeMinutes(timeMinutes)
                        .build());
            }

            entries.add(LeaderboardDTO.LeaderboardEntry.builder()
                    .rank(rank++)
                    .userId(participant.getUser().getId())
                    .username(participant.getUser().getUsername())
                    .totalPoints(participant.getTotalPoints())
                    .totalPenalty(participant.getTotalPenalty())
                    .problemStatuses(problemStatuses)
                    .build());
        }

        return LeaderboardDTO.builder()
                .contestId(contestId)
                .contestTitle(contest.getTitle())
                .entries(entries)
                .build();
    }

    /**
     * Update participant score after AC submission
     */
    @Transactional
    public void updateParticipantScore(UUID contestId, UUID userId, UUID problemId) {
        Contest contest = contestRepository.findById(contestId).orElse(null);
        if (contest == null) return;

        ContestParticipant participant = participantRepository.findByContest_IdAndUser_Id(contestId, userId).orElse(null);
        if (participant == null) return;

        Problem problem = problemRepository.findById(problemId).orElse(null);
        if (problem == null) return;

        // Check if this is the first AC for this problem
        List<Submission> acSubmissions = submissionRepository.findFirstAcSubmission(contestId, userId, problemId);
        if (acSubmissions.size() != 1) return; // Not first AC or no AC

        Submission firstAc = acSubmissions.get(0);
        LocalDateTime acTime = LocalDateTime.ofInstant(firstAc.getSubmittedAt(), ZoneId.systemDefault());
        Duration duration = Duration.between(contest.getStartTime(), acTime);
        int timeMinutes = (int) duration.toMinutes();

        // Penalty = time + 20 min per wrong submission
        Integer wrongAttempts = submissionRepository.countWrongAttempts(contestId, userId, problemId);
        int penalty = timeMinutes + (wrongAttempts * 20);

        participant.setTotalPoints(participant.getTotalPoints() + problem.getPoints());
        participant.setTotalPenalty(participant.getTotalPenalty() + penalty);
        participant.setLastAcTime(acTime);

        participantRepository.save(participant);
    }

    /**
     * Add problem to contest
     */
    @Transactional
    public ContestProblem addProblemToContest(UUID contestId, UUID problemId, Integer displayOrder) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        ContestProblem cp = ContestProblem.builder()
                .contest(contest)
                .problem(problem)
                .displayOrder(displayOrder)
                .build();

        return contestProblemRepository.save(cp);
    }

    /**
     * Remove problem from contest
     */
    @Transactional
    public void removeProblemFromContest(Long contestProblemId) {
        contestProblemRepository.deleteById(contestProblemId);
    }

    // Helper methods
    private ContestListDTO toListDTO(Contest contest) {
        Integer participantCount = participantRepository.countByContestId(contest.getId());
        List<ContestProblem> problems = contestProblemRepository.findByContest_IdOrderByDisplayOrderAsc(contest.getId());

        return ContestListDTO.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .participantCount(participantCount != null ? participantCount : 0)
                .status(getContestStatus(contest))
                .problemCount(problems.size())
                .build();
    }

    private String getContestStatus(Contest contest) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(contest.getStartTime())) {
            return "UPCOMING";
        } else if (now.isAfter(contest.getEndTime())) {
            return "ENDED";
        } else {
            return "ONGOING";
        }
    }
}
