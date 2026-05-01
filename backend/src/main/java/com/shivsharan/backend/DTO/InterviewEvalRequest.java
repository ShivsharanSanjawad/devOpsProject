package com.shivsharan.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewEvalRequest {

    @NotBlank(message = "Question text is required")
    private String question;

    @NotBlank(message = "Answer text is required")
    private String answer;

    /** Comma-separated expected topics, e.g. "react, performance, architecture" */
    private String topics;

    /** e.g. "Easy", "Medium", "Hard" */
    private String difficulty;
}
