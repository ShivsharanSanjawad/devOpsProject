package com.shivsharan.backend.DTO;

import com.shivsharan.backend.enums.Verdict;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponse implements Serializable {
    private UUID submissionId;
    private Verdict status ;
}
