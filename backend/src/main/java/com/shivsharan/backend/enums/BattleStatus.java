package com.shivsharan.backend.enums;

public enum BattleStatus {
    WAITING,        // Room created, waiting for opponent
    IN_PROGRESS,    // Both players joined, battle started
    COMPLETED,      // A winner has been decided
    CANCELLED       // Room creator left before match started
}
