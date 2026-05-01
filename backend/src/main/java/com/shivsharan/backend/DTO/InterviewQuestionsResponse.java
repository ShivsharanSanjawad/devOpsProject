package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewQuestionsResponse {

    private List<InterviewQuestion> questions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InterviewQuestion {
        private int id;
        private String difficulty;
        private String text;
        private List<String> topics;
    }
}
