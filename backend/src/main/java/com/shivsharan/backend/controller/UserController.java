package com.shivsharan.backend.controller;



import com.shivsharan.backend.Auth.JwtUtility;
import com.shivsharan.backend.DTO.JwtTokenResponse;
import com.shivsharan.backend.DTO.LoginRequest;
import com.shivsharan.backend.DTO.ProfileDTO;
import com.shivsharan.backend.DTO.RefreshTokenRequest;
import com.shivsharan.backend.DTO.UserDTO;
import com.shivsharan.backend.enums.Verdict;
import com.shivsharan.backend.model.Submission;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.ContestParticipantRepository;
import com.shivsharan.backend.repository.SubmissionRepository;
import com.shivsharan.backend.repository.UserRepository;
import com.shivsharan.backend.service.UserService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
public class UserController {

    @Value("${app.public-base-url:}")
    private String publicBaseUrl;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtility jwtUtility;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ContestParticipantRepository contestParticipantRepository;

    // ==================== PUBLIC ENDPOINTS ====================

    @PostMapping("/signUp")
    public ResponseEntity<?> signUp(@RequestBody UserDTO userDTO) {
        ResponseEntity<?> createResponse = userService.createUser(userDTO);
        if (!createResponse.getStatusCode().equals(HttpStatus.CREATED)) {
            return createResponse;
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    userDTO.getUsername(),
                    userDTO.getPassword()
                )
            );

            if (authentication.isAuthenticated()) {
            String accessToken = jwtUtility.generateToken(userDTO.getUsername());
            String refreshToken = jwtUtility.generateRefreshToken(userDTO.getUsername());

            JwtTokenResponse tokenResponse = JwtTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600000L)
                .username(userDTO.getUsername())
                .build();

            return ResponseEntity.ok(tokenResponse);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new HashMap<String, String>() {{
                put("error", "SignUp failed");
                }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("error", "SignUp failed");
                    }});
        }

    }

    /**
     * Login endpoint - sends OTP to registered email
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            if (authentication.isAuthenticated()) {
                String accessToken = jwtUtility.generateToken(loginRequest.getUsername());
                String refreshToken = jwtUtility.generateRefreshToken(loginRequest.getUsername());

                JwtTokenResponse tokenResponse = JwtTokenResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .expiresIn(3600000L)
                        .username(loginRequest.getUsername())
                        .build();

                return ResponseEntity.ok(tokenResponse);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("error", "Login failed");
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("error", "Login failed");
                    }});
        }
    }

    /**
     * Refresh Token endpoint - generates new access token from refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();

            if (jwtUtility.validateToken(refreshToken)) {
                String username = jwtUtility.getUsernameFromToken(refreshToken);

                // Generate new access token
                String newAccessToken = jwtUtility.generateToken(username);
                String newRefreshToken = jwtUtility.generateRefreshToken(username);

                JwtTokenResponse tokenResponse = JwtTokenResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .expiresIn(3600000L) // 1 hour in ms
                        .username(username)
                        .build();

                return ResponseEntity.ok(tokenResponse);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid refresh token");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("error", "Token refresh failed");
                    }});
        }
    }

    // ==================== USER ENDPOINTS (Authenticated Users) ====================

    /**
     * Get current user info - Available to all authenticated users
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String username = jwtUtility.getUsernameFromToken(token);

            if (username != null) {
                Optional<User> userOptional = userRepository.findByUsername(username);
                User user = userOptional.orElse(null);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                return ResponseEntity.ok()
                        .body(new HashMap<String, Object>() {{
                            put("username", username);
                            put("authorities", userDetails.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toList()));
                            if (user != null) {
                                put("description", user.getDescription());
                                put("college", user.getCollege() != null ? user.getCollege().name() : null);
                                put("gender", user.getGender() != null ? user.getGender().name() : null);
                                put("profileImageUrl", buildProfileImageUrl(user.getProfileImagePath()));
                            }
                        }});
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Failed to retrieve user info");
        }
    }

    /**
     * Update profile - image, description, college, gender
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String gender,
            @RequestPart(required = false) MultipartFile image
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User updated = userService.updateProfile(userOptional.get(), description, college, gender, image);
            return ResponseEntity.ok()
                    .body(new HashMap<String, Object>() {{
                        put("message", "Profile updated");
                        put("description", updated.getDescription());
                        put("college", updated.getCollege() != null ? updated.getCollege().name() : null);
                        put("gender", updated.getGender() != null ? updated.getGender().name() : null);
                        put("profileImageUrl", buildProfileImageUrl(updated.getProfileImagePath()));
                    }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{
                        put("error", e.getMessage());
                    }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Profile update failed");
                    }});
        }
    }

    /**
     * Get user profile with stats, rankings, and recent submissions
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();
            UUID userId = user.getId();

            // Get total problems solved (distinct problems with AC verdict)
            List<UUID> solvedProblemIds = submissionRepository.findSolvedProblemIds(userId, Verdict.AC);
            int totalProblemsSolved = solvedProblemIds.size();

            // Get total submissions
            List<Submission> allSubmissions = submissionRepository.findByUser_IdOrderBySubmittedAtDesc(userId);
            int totalSubmissions = allSubmissions.size();

            // Get contests participated
            int contestsParticipated = contestParticipantRepository.findByUser_Id(userId).size();

            // Get rankings
            Integer rating = user.getRating() != null ? user.getRating() : 0;
            Integer globalRank = userRepository.findGlobalRank(rating);
            
            Integer collegeRank = null;
            Integer totalUsersInCollege = null;
            if (user.getCollege() != null) {
                collegeRank = userRepository.findCollegeRank(user.getCollege(), rating);
                totalUsersInCollege = userRepository.countByCollege(user.getCollege());
            }

            // Get recent submissions (last 10)
            List<ProfileDTO.RecentSubmissionDTO> recentSubmissions = allSubmissions.stream()
                    .limit(10)
                    .map(sub -> ProfileDTO.RecentSubmissionDTO.builder()
                            .submissionId(sub.getId())
                            .problemId(sub.getProblem().getId())
                            .problemTitle(sub.getProblem().getTitle())
                            .language(sub.getLanguage())
                            .status(sub.getStatus().name())
                            .timeMs(sub.getTimeMs())
                            .memoryKb(sub.getMemoryKb())
                            .submittedAt(sub.getSubmittedAt())
                            .build())
                    .collect(Collectors.toList());

            ProfileDTO profile = ProfileDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .college(user.getCollege() != null ? user.getCollege().name() : null)
                    .gender(user.getGender() != null ? user.getGender().name() : null)
                    .description(user.getDescription())
                    .profileImageUrl(buildProfileImageUrl(user.getProfileImagePath()))
                    .createdAt(user.getCreatedAt())
                    .rating(rating)
                    .streak(user.getStreak() != null ? user.getStreak() : 0)
                    .totalProblemsSolved(totalProblemsSolved)
                    .totalSubmissions(totalSubmissions)
                    .contestsParticipated(contestsParticipated)
                    .globalRank(globalRank)
                    .collegeRank(collegeRank)
                    .totalUsersInCollege(totalUsersInCollege)
                    .recentSubmissions(recentSubmissions)
                    .build();

            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to retrieve profile: " + e.getMessage());
                    }});
        }
    }

    private String buildProfileImageUrl(String profileImagePath) {
        if (profileImagePath == null || profileImagePath.isBlank()) {
            return null;
        }
        String trimmed = profileImagePath.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        String baseUrl = publicBaseUrl != null ? publicBaseUrl.trim() : "";
        if (!baseUrl.isEmpty()) {
            return baseUrl.replaceAll("/+$", "") + "/" + profileImagePath;
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/")
                .path(profileImagePath)
                .toUriString();
    }

    /**
     * Change password - Available to all authenticated users
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Find user
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();

            // Verify old password
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{
                            put("error", "Old password is incorrect");
                        }});
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok()
                    .body(new HashMap<String, String>() {{
                        put("message", "Password changed successfully");
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to change password: " + e.getMessage());
                    }});
        }
    }

    // ==================== ADMIN ENDPOINTS (Admin Only) ====================

    /**
     * Get all users - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok()
                    .body(new HashMap<String, Object>() {{
                        put("totalUsers", users.size());
                        put("users", users.stream().map(u -> new HashMap<String, Object>() {{
                            put("id", u.getId());
                            put("username", u.getUsername());
                            put("role", u.getRole());
                        }}).collect(Collectors.toList()));
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to retrieve users: " + e.getMessage());
                    }});
        }
    }

    /**
     * Get user by username - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();
            return ResponseEntity.ok()
                    .body(new HashMap<String, Object>() {{
                        put("id", user.getId());
                        put("username", user.getUsername());
                        put("role", user.getRole());
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to retrieve user: " + e.getMessage());
                    }});
        }
    }

    /**
     * Promote user to admin - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/users/{username}/promote")
    public ResponseEntity<?> promoteUserToAdmin(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();
            user.setRole(com.shivsharan.backend.model.AcessLevel.ADMIN);
            userRepository.save(user);

            return ResponseEntity.ok()
                    .body(new HashMap<String, String>() {{
                        put("message", "User promoted to ADMIN successfully");
                        put("username", username);
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to promote user: " + e.getMessage());
                    }});
        }
    }

    /**
     * Demote admin to user - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/users/{username}/demote")
    public ResponseEntity<?> demoteAdminToUser(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();
            user.setRole(com.shivsharan.backend.model.AcessLevel.USER);
            userRepository.save(user);

            return ResponseEntity.ok()
                    .body(new HashMap<String, String>() {{
                        put("message", "User demoted to USER successfully");
                        put("username", username);
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to demote user: " + e.getMessage());
                    }});
        }
    }

    /**
     * Delete user - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/users/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            User user = userOptional.get();
            userRepository.delete(user);

            return ResponseEntity.ok()
                    .body(new HashMap<String, String>() {{
                        put("message", "User deleted successfully");
                        put("username", username);
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to delete user: " + e.getMessage());
                    }});
        }
    }

    /**
     * Get admin statistics - Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/statistics")
    public ResponseEntity<?> getAdminStatistics() {
        try {
            List<User> allUsers = userRepository.findAll();
            long adminCount = allUsers.stream()
                    .filter(u -> u.getRole() == com.shivsharan.backend.model.AcessLevel.ADMIN)
                    .count();
            long userCount = allUsers.stream()
                    .filter(u -> u.getRole() == com.shivsharan.backend.model.AcessLevel.USER)
                    .count();

            return ResponseEntity.ok()
                    .body(new HashMap<String, Object>() {{
                        put("totalUsers", allUsers.size());
                        put("adminCount", adminCount);
                        put("userCount", userCount);
                    }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to retrieve statistics: " + e.getMessage());
                    }});
        }
    }
}
