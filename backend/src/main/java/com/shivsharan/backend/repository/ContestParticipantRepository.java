package com.shivsharan.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.model.ContestParticipant;
import com.shivsharan.backend.model.ContestParticipantId;

@Repository
public interface ContestParticipantRepository extends JpaRepository<ContestParticipant, ContestParticipantId> {

    @Query("SELECT cp FROM ContestParticipant cp WHERE cp.contest.id = :contestId ORDER BY cp.totalPoints DESC, cp.totalPenalty ASC")
    List<ContestParticipant> findLeaderboard(@Param("contestId") UUID contestId);
    
    @Query("SELECT COUNT(cp) FROM ContestParticipant cp WHERE cp.contest.id = :contestId")
    Integer countByContestId(@Param("contestId") UUID contestId);
    
    boolean existsByContest_IdAndUser_Id(UUID contestId, UUID userId);
    
    Optional<ContestParticipant> findByContest_IdAndUser_Id(UUID contestId, UUID userId);
    
    List<ContestParticipant> findByUser_Id(UUID userId);
}
