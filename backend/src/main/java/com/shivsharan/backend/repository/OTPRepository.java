package com.shivsharan.backend.repository;

import java.util.Optional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.shivsharan.backend.model.OTP;
import com.shivsharan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OTPRepository extends JpaRepository<OTP, UUID> {
    Optional<OTP> findByUserAndOtpValueAndIsUsedFalse(User user, Integer otpValue);
    
    Optional<OTP> findLatestByUserAndIsUsedFalse(User user);
    
    List<OTP> findByUserAndIsUsedFalse(User user);
    
    @Query("SELECT o FROM OTP o WHERE o.user = :user AND o.isUsed = false AND o.expiryTime > CURRENT_TIMESTAMP ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OTP> findLatestValidOtpForUser(@Param("user") User user);
}
