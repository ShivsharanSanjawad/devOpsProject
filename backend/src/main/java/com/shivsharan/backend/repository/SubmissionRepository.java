package com.shivsharan.backend.repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.contest LEFT JOIN FETCH s.user LEFT JOIN FETCH s.problem WHERE s.id = :id")
    Optional<Submission> findById(@Param("id") UUID id);

    List<Submission> findByUser_IdOrderBySubmittedAtDesc(UUID userId);
    
    List<Submission> findByProblem_IdOrderBySubmittedAtDesc(UUID problemId);
    
    List<Submission> findByUser_IdAndProblem_Id(UUID userId, UUID problemId);
    
    List<Submission> findByUser_IdAndProblem_IdOrderBySubmittedAtDesc(UUID userId, UUID problemId);

    List<Submission> findByContest_Id(UUID contestId);
    
    List<Submission> findByContest_IdAndUser_IdOrderBySubmittedAtDesc(UUID contestId, UUID userId);
    
    List<Submission> findByContest_IdAndUser_IdAndProblem_Id(UUID contestId, UUID userId, UUID problemId);
    
    @Query("SELECT s FROM Submission s WHERE s.contest.id = :contestId AND s.user.id = :userId AND s.problem.id = :problemId AND s.status = 'AC' ORDER BY s.submittedAt ASC")
    List<Submission> findFirstAcSubmission(@Param("contestId") UUID contestId, @Param("userId") UUID userId, @Param("problemId") UUID problemId);

    @Query("SELECT DISTINCT s.problem.id FROM Submission s WHERE s.user.id = :userId AND s.status = :verdict")
    List<UUID> findSolvedProblemIds(@Param("userId") UUID userId, @Param("verdict") Verdict verdict);

    @Query("SELECT DISTINCT s.problem.id FROM Submission s WHERE s.user.id = :userId")
    List<UUID> findAttemptedProblemIds(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.contest.id = :contestId AND s.user.id = :userId AND s.problem.id = :problemId AND s.status != 'AC'")
    Integer countWrongAttempts(@Param("contestId") UUID contestId, @Param("userId") UUID userId, @Param("problemId") UUID problemId);
}
