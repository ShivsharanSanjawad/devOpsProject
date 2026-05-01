package com.shivsharan.backend.DTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.shivsharan.backend.enums.Difficulty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemDetailDTO {

    private UUID id;
    private String title;
    private List<String> topics;
    private Double acceptanceRate;
    private Difficulty difficulty;
    private Boolean solvedByUser;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private String description;
    private List<ExampleTestCase> examples;
    private String constraints;
    private Integer points;
    private List<SubmissionSummary> mySubmissions;
    private Map<String, SolutionDTO> solutions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExampleTestCase {
        private Integer order;
        private String input;
        private String output;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionSummary {
        private UUID id;
        private String status;
        private String language;
        private Integer timeMs;
        private Integer memoryKb;
        private String submittedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SolutionDTO {
        private String language;
        private String code;
        private String explanation;
    }
}
