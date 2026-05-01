package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestDetailDTO {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Integer participantCount;
    private Boolean isRegistered;
    private List<ContestProblemDTO> problems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContestProblemDTO {
        private Integer order;
        private UUID problemId;
        private String title;
        private String difficulty;
        private Integer points;
        private Integer timeLimitMs;
        private Integer memoryLimitMb;
    }
}
