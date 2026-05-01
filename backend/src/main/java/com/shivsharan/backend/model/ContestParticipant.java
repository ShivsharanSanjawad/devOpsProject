package com.shivsharan.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contest_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestParticipant {

    @EmbeddedId
    private ContestParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("contestId")
    @JoinColumn(name = "contest_id")
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    private Integer totalPoints = 0;

    @Builder.Default
    private Integer totalPenalty = 0;

    private LocalDateTime lastAcTime;

    @Builder.Default
    private Boolean isVirtual = false;

    private LocalDateTime virtualStartTime;
}

