package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewEvalResponse {

    private int overall;
    private List<Metric> metrics;
    private String strengths;
    private String improvements;
    private String detailedFeedback;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Metric {
        private String label;
        private int score;
    }
}
