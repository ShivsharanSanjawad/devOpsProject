package com.shivsharan.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private UUID id;
    private String username;
    private String email;
    private String college;
    private String gender;
    private String description;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    
    // Stats
    private Integer rating;
    private Integer streak;
    private Integer totalProblemsSolved;
    private Integer totalSubmissions;
    private Integer contestsParticipated;
    
    // Rankings
    private Integer globalRank;
    private Integer collegeRank;
    private Integer totalUsersInCollege;
    
    // Recent activity
    private List<RecentSubmissionDTO> recentSubmissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSubmissionDTO {
        private UUID submissionId;
        private UUID problemId;
        private String problemTitle;
        private String language;
        private String status;
        private Integer timeMs;
        private Integer memoryKb;
        private Instant submittedAt;
    }
}
