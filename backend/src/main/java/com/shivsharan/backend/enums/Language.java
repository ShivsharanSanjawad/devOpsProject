package com.shivsharan.backend.enums;

public enum Language {
    PYTHON,
    JAVASCRIPT,
    CPP,
    JAVA;

    public String getFileExtension() {
        return switch (this) {
            case PYTHON -> "py";
            case JAVASCRIPT -> "js";
            case CPP -> "cpp";
            case JAVA -> "java";
        };
    }

    public boolean requiresCompilation() {
        return this == CPP || this == JAVA;
    }
}