package com.shivsharan.backend.model;

import java.time.Instant;
import java.util.UUID;

import com.shivsharan.backend.enums.BattleStatus;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "battles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Battle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** 6-character alphanumeric party code */
    @Column(name = "party_code", nullable = false, unique = true, length = 6)
    private String partyCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player1_id", nullable = false)
    private User player1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player2_id")
    private User player2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BattleStatus status = BattleStatus.WAITING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    /** Latest verdict string for player 1 (AC, WA, TLE, etc.) */
    @Column(name = "player1_verdict", length = 20)
    private String player1Verdict;

    /** Latest verdict string for player 2 (AC, WA, TLE, etc.) */
    @Column(name = "player2_verdict", length = 20)
    private String player2Verdict;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    /** Duration limit in seconds (default 30 min) */
    @Column(name = "time_limit_secs")
    private Integer timeLimitSecs = 1800;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }
}
