package com.shivsharan.backend.model;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.shivsharan.backend.enums.Difficulty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@AllArgsConstructor
@Table(name = "problems")
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "title", length = 255)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "time_limit_ms")
    private Integer timeLimitMs = 2000;

    @Column(name = "memory_limit_mb")
    private Integer memoryLimitMb = 256;

    @Column(nullable = false)
    private Integer points;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestCase> testCases;

    @ManyToMany
    @JoinTable(
            name = "problem_topic_map",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    private Set<Topic> topics;

    @ManyToMany
    @JoinTable(
            name = "problem_company_map",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "company_id")
    )
    private Set<CompanyTag> companyTags;

    @Column(name = "checker_type", length = 50)
    private String checkerType = "EXACT"; // EXACT, FLOAT, TOKEN, SPECIAL

    public Problem() {
    }
}
