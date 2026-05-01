package com.shivsharan.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeHintRequest {

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Code is required")
    private String code;

    private String errors;
}
