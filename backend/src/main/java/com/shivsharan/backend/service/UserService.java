package com.shivsharan.backend.service;


import com.shivsharan.backend.DTO.UserDTO;
import com.shivsharan.backend.mailUtils.mailService;
import com.shivsharan.backend.model.College;
import com.shivsharan.backend.model.Gender;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private mailService mailService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public ResponseEntity<?> createUser(UserDTO userDTO) {
        try {
            // Validate inputs
            if (userDTO.getUsername() == null || userDTO.getUsername().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Username cannot be empty"));
            }

            if (userDTO.getPassword() == null || userDTO.getPassword().length() < 8) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Password must be at least 8 characters long"));
            }

            if (userDTO.getEmail() == null || userDTO.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Email cannot be empty"));
            }

            // Check if user already exists
            Optional<User> existingUser = userRepository.findByUsername(userDTO.getUsername());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse("Username already exists"));
            }

            // Create new user with encoded password
                User user = new User(
                    userDTO.getUsername(),
                    passwordEncoder.encode(userDTO.getPassword()),
                    userDTO.getEmail()
            );
                applyOptionalProfileFields(user, userDTO);
            User savedUser = userRepository.save(user);

                mailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("User with this username already exists"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("User registration failed: " + e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    private void applyOptionalProfileFields(User user, UserDTO userDTO) {
        if (userDTO.getDescription() != null && !userDTO.getDescription().isBlank()) {
            user.setDescription(userDTO.getDescription().trim());
        }

        if (userDTO.getCollege() != null && !userDTO.getCollege().isBlank()) {
                user.setCollege(College.valueOf(userDTO.getCollege()));
        }

        if (userDTO.getGender() != null && !userDTO.getGender().isBlank()) {
                user.setGender(Gender.valueOf(userDTO.getGender()));
        }
    }

    public User updateProfile(User user, String description, String college, String gender, MultipartFile image) {
        if (description != null && !description.isBlank()) {
            user.setDescription(description.trim());
        }

        if (college != null && !college.isBlank()) {
            College collegeEnum = parseEnumValue(College.class, college);
            if (collegeEnum != null) {
                user.setCollege(collegeEnum);
            }
        }

        if (gender != null && !gender.isBlank()) {
            Gender genderEnum = parseEnumValue(Gender.class, gender);
            if (genderEnum != null) {
                user.setGender(genderEnum);
            }
        }

        if (image != null && !image.isEmpty()) {
            String storedPath = storeProfileImage(user.getUsername(), image);
            user.setProfileImagePath(storedPath);
        }

        return userRepository.save(user);
    }

    private String storeProfileImage(String username, MultipartFile image) {
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image uploads are allowed");
        }

        String originalName = image.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }

        String fileName = username + "-" + Instant.now().toEpochMilli() + extension;
        Path targetDir = Paths.get(uploadDir, "profile-images");
        Path targetPath = targetDir.resolve(fileName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store profile image", e);
        }

        return "profile-images/" + fileName;
    }

    private <T extends Enum<T>> T parseEnumValue(Class<T> enumType, String value) {
        String normalized = value.trim().toUpperCase().replace(' ', '_');
        try {
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
