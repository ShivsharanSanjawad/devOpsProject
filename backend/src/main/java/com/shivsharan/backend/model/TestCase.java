package com.shivsharan.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "test_cases")
@Data
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnore
    private Problem problem;

    @Column(name = "input_path", columnDefinition = "text")
    private String inputPath;

    @Column(name = "output_path", columnDefinition = "text")
    private String outputPath;

    @Column(name = "points")
    private Integer points = 10;

    @Column(name = "is_sample")
    private Boolean isSample = false;

    @Column(name = "ordering")
    private Integer ordering = 0;

    public TestCase() {
    }

    // Expose problemId for JSON serialization
    public java.util.UUID getProblemId() {
        return problem != null ? problem.getId() : null;
    }
}
