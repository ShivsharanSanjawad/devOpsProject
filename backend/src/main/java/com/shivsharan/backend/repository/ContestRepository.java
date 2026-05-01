package com.shivsharan.backend.repository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.model.Contest;

@Repository
public interface ContestRepository extends JpaRepository<Contest, UUID> {

    boolean existsByTitle(String title);
    
    // Upcoming contests (startTime > now)
    List<Contest> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);
    
    // Ongoing contests (startTime <= now AND endTime >= now)
    @Query("SELECT c FROM Contest c WHERE c.startTime <= :now AND c.endTime >= :now ORDER BY c.endTime ASC")
    List<Contest> findOngoingContests(@Param("now") LocalDateTime now);
    
    // Past contests (endTime < now)
    List<Contest> findByEndTimeBeforeOrderByEndTimeDesc(LocalDateTime now);
    
    // All contests ordered by start time
    List<Contest> findAllByOrderByStartTimeDesc();
}
