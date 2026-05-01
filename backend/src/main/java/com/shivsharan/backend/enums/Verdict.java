package com.shivsharan.backend.enums;

public enum Verdict {
    AC,   // Accepted
    WA,   // Wrong Answer
    TLE,  // Time Limit Exceeded
    MLE,  // Memory Limit Exceeded
    RE,   // Runtime Error (non-zero exit)
    CE,   // Compile Error
    PENDING,
    RUNNING,
    PENDING_MANUAL
}