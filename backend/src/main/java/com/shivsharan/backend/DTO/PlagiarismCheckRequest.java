package com.shivsharan.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlagiarismCheckRequest {

    @NotBlank(message = "Code is required")
    private String code;

    /** Programming language (e.g. "java", "python", "cpp") */
    private String language;

    /** Optional: the problem statement for context */
    private String problemStatement;
}
