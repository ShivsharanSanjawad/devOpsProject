package com.shivsharan.backend.DTO;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDTO implements Serializable {

    @NotBlank(message = "Input path is required")
    @Size(min = 1, max = 500, message = "Input path must be between 1 and 500 characters")
    private String inputPath;

    @NotBlank(message = "Output path is required")
    @Size(min = 1, max = 500, message = "Output path must be between 1 and 500 characters")
    private String outputPath;

    private Integer points = 10;
    private Boolean isSample = false;
    private Integer ordering = 0;
}
