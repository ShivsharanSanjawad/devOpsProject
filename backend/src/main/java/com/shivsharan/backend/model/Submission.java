package com.shivsharan.backend.model;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.shivsharan.backend.enums.Verdict;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "submissions")
@Data
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnore
    private Problem problem;

    @Column(name = "language")
    private String language;

    @Lob
    @Column(name = "code", columnDefinition = "text")
    private String code;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id")
    @JsonIgnore
    private Contest contest;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Verdict status = Verdict.PENDING;

    @Column(name = "time_ms")
    private Integer timeMs;

    @Column(name = "memory_kb")
    private Integer memoryKb;

    @Lob
    @Column(name = "compile_error", columnDefinition = "text")
    private String compileError;

    @Column(name = "judged_at")
    private Instant judgedAt;

    // ── Plagiarism fields (auto-checked before judging) ──
    @Column(name = "plagiarism_verdict")
    private String plagiarismVerdict;

    @Column(name = "originality_score")
    private Integer originalityScore;

    @Column(name = "ai_likelihood")
    private Integer aiLikelihood;

    @Lob
    @Column(name = "plagiarism_explanation", columnDefinition = "text")
    private String plagiarismExplanation;

    @Column(name = "plagiarism_penalty")
    private Boolean plagiarismPenalty = false;

    @PrePersist
    public void setSubmittet(){
        this.submittedAt = Instant.now() ;
    }

    public void setVerdictDetail(String s) {

    }

    // Expose IDs for JSON serialization
    public UUID getProblemId() {
        return problem != null ? problem.getId() : null;
    }

    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }
}
