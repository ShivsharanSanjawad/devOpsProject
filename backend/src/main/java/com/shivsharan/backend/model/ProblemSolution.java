package com.shivsharan.backend.model;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "problem_solutions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"problem_id", "language"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnore
    private Problem problem;

    @Column(name = "language", nullable = false, length = 20)
    private String language; // PYTHON, JAVA, CPP, JAVASCRIPT, C

    @Lob
    @Column(name = "code", columnDefinition = "text", nullable = false)
    private String code;

    @Lob
    @Column(name = "explanation", columnDefinition = "text")
    private String explanation;

    // Expose problemId for JSON serialization
    public UUID getProblemId() {
        return problem != null ? problem.getId() : null;
    }
}
