package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewQuestionsRequest {

    /** e.g. "Frontend Developer", "Backend Engineer", "Data Scientist" */
    private String role;

    /** Number of questions to generate (default handled in service) */
    private int count;

    /** e.g. "Medium", "Hard", or "Mixed" */
    private String difficulty;
}
