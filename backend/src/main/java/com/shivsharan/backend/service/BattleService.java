package com.shivsharan.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shivsharan.backend.DTO.BattleDTO;
import com.shivsharan.backend.enums.BattleStatus;
import com.shivsharan.backend.enums.Difficulty;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Battle;
import com.shivsharan.backend.model.Problem;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.BattleRepository;
import com.shivsharan.backend.repository.ProblemRepository;

@Service
public class BattleService {

    private static final Logger logger = LoggerFactory.getLogger(BattleService.class);
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private BattleRepository battleRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ─── Create Room ─────────────────────────────────────────────────────
    @Transactional
    public BattleDTO createRoom(User creator) {
        String code = generateUniqueCode();

        Battle battle = new Battle();
        battle.setPartyCode(code);
        battle.setPlayer1(creator);
        battle.setStatus(BattleStatus.WAITING);
        battle = battleRepository.save(battle);

        logger.info("Battle room {} created by {}", code, creator.getUsername());
        return toDTO(battle);
    }

    // ─── Join Room ───────────────────────────────────────────────────────
    @Transactional
    public BattleDTO joinRoom(String partyCode, User joiner) {
        Battle battle = battleRepository.findByPartyCodeAndStatus(partyCode.toUpperCase(), BattleStatus.WAITING)
                .orElseThrow(() -> new IllegalArgumentException("Room not found or already started"));

        if (battle.getPlayer1().getId().equals(joiner.getId())) {
            throw new IllegalArgumentException("You cannot join your own room");
        }

        battle.setPlayer2(joiner);

        // Pick a random problem
        Problem problem = pickRandomProblem();
        battle.setProblem(problem);
        battle.setStatus(BattleStatus.IN_PROGRESS);
        battle.setStartedAt(Instant.now());
        battle = battleRepository.save(battle);

        BattleDTO dto = toDTO(battle);

        // Notify both players via WebSocket
        messagingTemplate.convertAndSend("/topic/battle/" + battle.getId(), dto);

        logger.info("Player {} joined room {}. Battle started with problem: {}",
                joiner.getUsername(), partyCode, problem.getTitle());
        return dto;
    }

    // ─── Get Battle ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BattleDTO getBattle(UUID battleId) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new IllegalArgumentException("Battle not found"));
        return toDTO(battle);
    }

    // ─── Get Battle by Party Code ────────────────────────────────────────
    @Transactional(readOnly = true)
    public BattleDTO getBattleByCode(String partyCode) {
        Battle battle = battleRepository.findByPartyCode(partyCode.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        return toDTO(battle);
    }

    // ─── Cancel Room ─────────────────────────────────────────────────────
    @Transactional
    public void cancelRoom(String partyCode, User user) {
        Battle battle = battleRepository.findByPartyCodeAndStatus(partyCode.toUpperCase(), BattleStatus.WAITING)
                .orElseThrow(() -> new IllegalArgumentException("Room not found or already started"));

        if (!battle.getPlayer1().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the room creator can cancel");
        }

        battle.setStatus(BattleStatus.CANCELLED);
        battleRepository.save(battle);

        messagingTemplate.convertAndSend("/topic/battle/" + battle.getId(),
                toDTO(battle));

        logger.info("Battle room {} cancelled by {}", partyCode, user.getUsername());
    }

    // ─── Handle Submission Verdict (called from JudgeService) ────────────
    @Transactional
    public void onSubmissionJudged(Submission sub) {
        // Find any IN_PROGRESS battle where this user is a player and problem matches
        UUID problemId = sub.getProblem().getId();
        UUID userId = sub.getUser().getId();

        List<Battle> battles = battleRepository.findActiveBattlesForUser(
                BattleStatus.IN_PROGRESS, problemId, userId);

        for (Battle battle : battles) {
            // Guard: re-check status to prevent race condition with concurrent AC
            if (battle.getStatus() != BattleStatus.IN_PROGRESS) {
                logger.info("Battle {} already completed, skipping verdict update", battle.getPartyCode());
                continue;
            }

            boolean isPlayer1 = battle.getPlayer1().getId().equals(userId);
            String verdictStr = sub.getStatus().name();

            // Persist verdict on the Battle entity
            if (isPlayer1) {
                battle.setPlayer1Verdict(verdictStr);
            } else {
                battle.setPlayer2Verdict(verdictStr);
            }

            // If AC → this player wins
            if (sub.getStatus() == Verdict.AC) {
                battle.setWinner(sub.getUser());
                battle.setStatus(BattleStatus.COMPLETED);
                battle.setFinishedAt(Instant.now());
                logger.info("Battle {} won by {} with AC!", battle.getPartyCode(),
                        sub.getUser().getUsername());
            }

            battle = battleRepository.save(battle);

            BattleDTO dto = toDTO(battle);
            messagingTemplate.convertAndSend("/topic/battle/" + battle.getId(), dto);
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private Problem pickRandomProblem() {
        // Try EASY first, then MEDIUM, then any
        List<Problem> problems = problemRepository.findByDifficulty(Difficulty.EASY);
        if (problems.isEmpty()) {
            problems = problemRepository.findByDifficulty(Difficulty.MEDIUM);
        }
        if (problems.isEmpty()) {
            problems = problemRepository.findAll();
        }
        if (problems.isEmpty()) {
            throw new IllegalStateException("No problems available for battle");
        }
        return problems.get(RANDOM.nextInt(problems.size()));
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 100; attempt++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            }
            String code = sb.toString();
            if (battleRepository.findByPartyCode(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate unique party code");
    }

    private BattleDTO toDTO(Battle b) {
        BattleDTO dto = new BattleDTO();
        dto.setId(b.getId());
        dto.setPartyCode(b.getPartyCode());
        dto.setStatus(b.getStatus());
        dto.setStartedAt(b.getStartedAt());
        dto.setFinishedAt(b.getFinishedAt());
        dto.setTimeLimitSecs(b.getTimeLimitSecs());

        // Player 1
        User p1 = b.getPlayer1();
        dto.setPlayer1(new BattleDTO.PlayerInfo(p1.getId(), p1.getUsername(),
                p1.getRating() != null ? p1.getRating() : 0));

        // Player 2
        if (b.getPlayer2() != null) {
            User p2 = b.getPlayer2();
            dto.setPlayer2(new BattleDTO.PlayerInfo(p2.getId(), p2.getUsername(),
                    p2.getRating() != null ? p2.getRating() : 0));
        }

        // Problem (only if battle has started)
        if (b.getStatus() == BattleStatus.IN_PROGRESS || b.getStatus() == BattleStatus.COMPLETED) {
            Problem prob = b.getProblem();
            if (prob != null) {
                dto.setProblemId(prob.getId());
                dto.setProblemTitle(prob.getTitle());
                dto.setProblemBody(prob.getBody());
                dto.setProblemDifficulty(prob.getDifficulty());
                dto.setTimeLimitMs(prob.getTimeLimitMs());
                dto.setMemoryLimitMb(prob.getMemoryLimitMb());
            }
        }

        // Winner
        if (b.getWinner() != null) {
            dto.setWinnerUsername(b.getWinner().getUsername());
        }

        // Live verdicts — read from entity (persisted)
        dto.setPlayer1Verdict(b.getPlayer1Verdict());
        dto.setPlayer2Verdict(b.getPlayer2Verdict());

        return dto;
    }
}
