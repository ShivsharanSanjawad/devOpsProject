package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlagiarismCheckResponse {

    /** Overall verdict: "LIKELY_ORIGINAL", "SUSPICIOUS", "LIKELY_AI_GENERATED", "LIKELY_PLAGIARISED" */
    private String verdict;

    /** Confidence score 0-100 that the code is original (100 = definitely original) */
    private int originalityScore;

    /** Confidence score 0-100 that the code is AI-generated */
    private int aiLikelihood;

    /** Specific signals/indicators found */
    private List<String> indicators;

    /** Detailed explanation of the analysis */
    private String explanation;

    /** Suggestions for the reviewer */
    private String recommendation;
}
