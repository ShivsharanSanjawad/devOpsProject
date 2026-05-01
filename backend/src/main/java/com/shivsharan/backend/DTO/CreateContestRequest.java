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
public class CreateContestRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<ContestProblemRequest> problems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContestProblemRequest {
        private UUID problemId;
        private Integer displayOrder;
    }
}
