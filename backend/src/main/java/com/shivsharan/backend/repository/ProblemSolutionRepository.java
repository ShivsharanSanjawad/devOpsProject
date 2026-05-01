package com.shivsharan.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.model.ProblemSolution;

@Repository
public interface ProblemSolutionRepository extends JpaRepository<ProblemSolution, Long> {
    
    List<ProblemSolution> findByProblem_Id(UUID problemId);
    
    Optional<ProblemSolution> findByProblem_IdAndLanguage(UUID problemId, String language);
    
    void deleteByProblem_Id(UUID problemId);
}
