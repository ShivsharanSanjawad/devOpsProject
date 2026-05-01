package com.shivsharan.backend.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestParticipantId implements Serializable {
    private UUID contestId;
    private UUID userId;
}

