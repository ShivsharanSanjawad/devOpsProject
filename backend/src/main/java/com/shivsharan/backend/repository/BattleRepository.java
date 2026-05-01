package com.shivsharan.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.enums.BattleStatus;
import com.shivsharan.backend.model.Battle;

@Repository
public interface BattleRepository extends JpaRepository<Battle, UUID> {
    Optional<Battle> findByPartyCode(String partyCode);
    Optional<Battle> findByPartyCodeAndStatus(String partyCode, BattleStatus status);

    @Query("SELECT b FROM Battle b WHERE b.status = :status AND b.problem.id = :problemId "
         + "AND (b.player1.id = :userId OR b.player2.id = :userId)")
    List<Battle> findActiveBattlesForUser(@Param("status") BattleStatus status,
                                          @Param("problemId") UUID problemId,
                                          @Param("userId") UUID userId);
}
