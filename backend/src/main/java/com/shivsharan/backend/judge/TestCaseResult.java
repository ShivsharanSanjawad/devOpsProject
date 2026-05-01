package com.shivsharan.backend.judge;

public class TestCaseResult {
    private Long testCaseId;
    private String verdict;
    private Integer timeMs;
    private Integer memoryKb;
    private String message;
    private String actualOutput;
    private String expectedOutput;

    public TestCaseResult() {}

    public TestCaseResult(Long testCaseId, String verdict, Integer timeMs, Integer memoryKb, String message) {
        this.testCaseId = testCaseId;
        this.verdict = verdict;
        this.timeMs = timeMs;
        this.memoryKb = memoryKb;
        this.message = message;
    }

    public TestCaseResult(Long testCaseId, String verdict, Integer timeMs, Integer memoryKb, String message,
                          String actualOutput, String expectedOutput) {
        this.testCaseId = testCaseId;
        this.verdict = verdict;
        this.timeMs = timeMs;
        this.memoryKb = memoryKb;
        this.message = message;
        this.actualOutput = actualOutput;
        this.expectedOutput = expectedOutput;
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

    public String getActualOutput() {
        return actualOutput;
    }

    public void setActualOutput(String actualOutput) {
        this.actualOutput = actualOutput;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }
}
