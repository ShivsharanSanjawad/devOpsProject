package com.shivsharan.backend.judge;

public class TestCaseResult {
    private Long testCaseId;
    private String verdict;
    private Integer timeMs;
    private Integer memoryKb;
    private String message;

    public TestCaseResult() {}

    public TestCaseResult(Long testCaseId, String verdict, Integer timeMs, Integer memoryKb, String message) {
        this.testCaseId = testCaseId;
        this.verdict = verdict;
        this.timeMs = timeMs;
        this.memoryKb = memoryKb;
        this.message = message;
    }

    public Long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(Long testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getVerdict() {
        return verdict;
    }

    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }

    public Integer getTimeMs() {
        return timeMs;
    }

    public void setTimeMs(Integer timeMs) {
        this.timeMs = timeMs;
    }

    public Integer getMemoryKb() {
        return memoryKb;
    }

    public void setMemoryKb(Integer memoryKb) {
        this.memoryKb = memoryKb;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
