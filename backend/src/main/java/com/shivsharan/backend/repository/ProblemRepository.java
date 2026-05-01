package com.shivsharan.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.enums.Difficulty;
import com.shivsharan.backend.model.Problem;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, UUID> {
    List<Problem> findByDifficulty(Difficulty difficulty);
    boolean existsByTitle(String title);
    Optional<Problem> findByTitle(String title);
}
