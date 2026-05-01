package com.shivsharan.backend.judge;

import java.io.Serializable;

public class JudgeJob implements Serializable {
    private String submissionId;

    public JudgeJob() {}

    public JudgeJob(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }
}
