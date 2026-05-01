package com.shivsharan.backend.DTO;

import java.time.Instant;
import java.util.UUID;

import com.shivsharan.backend.enums.BattleStatus;
import com.shivsharan.backend.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleDTO {
    private UUID id;
    private String partyCode;
    private BattleStatus status;

    // Player info
    private PlayerInfo player1;
    private PlayerInfo player2;

    // Problem info (only sent once status is IN_PROGRESS)
    private UUID problemId;
    private String problemTitle;
    private String problemBody;
    private Difficulty problemDifficulty;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;

    // Battle timing
    private Instant startedAt;
    private Instant finishedAt;
    private Integer timeLimitSecs;

    // Result
    private String winnerUsername;

    // Player submission status (live updates)
    private String player1Verdict;
    private String player2Verdict;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerInfo {
        private UUID id;
        private String username;
        private Integer rating;
    }
}
