package com.shivsharan.backend.enums;

public enum CheckerType {
    EXACT,   // token-by-token exact match (whitespace-tolerant)
    FLOAT,   // floating point with epsilon
    TOKEN    // order-insensitive token comparison
}