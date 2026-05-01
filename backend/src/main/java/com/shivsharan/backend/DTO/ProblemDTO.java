package com.shivsharan.backend.DTO;

import java.io.Serializable;

import com.shivsharan.backend.enums.Difficulty;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDTO implements Serializable {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    private String body;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotNull(message = "Points is required")
    @Min(value = 1, message = "Points must be at least 1")
    private Integer points;

    @Min(value = 100, message = "Time limit must be at least 100ms")
    @Max(value = 60000, message = "Time limit must not exceed 60000ms")
    private Integer timeLimitMs = 2000;

    @Min(value = 16, message = "Memory limit must be at least 16MB")
    @Max(value = 2048, message = "Memory limit must not exceed 2048MB")
    private Integer memoryLimitMb = 256;

    @Size(max = 50, message = "Checker type must not exceed 50 characters")
    private String checkerType = "EXACT";

}
