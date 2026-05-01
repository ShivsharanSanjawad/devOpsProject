package com.shivsharan.backend.repository;


import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.model.ContestProblem;

@Repository
public interface ContestProblemRepository extends JpaRepository<ContestProblem, Long> {
    List<ContestProblem> findByContest_IdOrderByDisplayOrderAsc(UUID contestId);
}
