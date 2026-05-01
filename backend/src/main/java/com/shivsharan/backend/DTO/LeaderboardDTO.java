package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private UUID contestId;
    private String contestTitle;
    private List<LeaderboardEntry> entries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaderboardEntry {
        private Integer rank;
        private UUID userId;
        private String username;
        private Integer totalPoints;
        private Integer totalPenalty; // in minutes
        private Map<UUID, ProblemStatus> problemStatuses; // problemId -> status
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemStatus {
        private Boolean solved;
        private Integer points;
        private Integer attempts;
        private Integer timeMinutes; // time from contest start to AC
    }
}
