package com.shivsharan.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.shivsharan.backend.model.TestCase;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblem_Id(UUID problemId);
    List<TestCase> findByProblem_IdAndIsSampleTrue(UUID problemId);
    List<TestCase> findByProblem_IdOrderByOrderingAsc(UUID id);
    
    @Transactional
    void deleteByProblem_Id(UUID problemId);
}
