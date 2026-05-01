package com.shivsharan.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import com.shivsharan.backend.mailUtils.mailService;
import com.shivsharan.backend.model.OTP;
import com.shivsharan.backend.model.User;
import com.shivsharan.backend.repository.OTPRepository;
import com.shivsharan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class OTPService {

    @Autowired
    private mailService mailService;

    @Autowired
    private SecureRandom random;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    private static final int OTP_EXPIRY_MINUTES = 5;

    /**
     * Generate and send OTP to user
     */
    public boolean sendOTP(String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return false;
            }

            User user = userOptional.get();
            int otpValue = generateOTP();

            // Mark old OTPs as used
            invalidateOldOtps(user);

            // Create new OTP
            OTP otp = OTP.builder()
                    .user(user)
                    .otpValue(otpValue)
                    .expiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                    .isUsed(false)
                    .build();

            otpRepository.save(otp);

            // Send OTP email
            return mailService.sendOTP(user.getEmail(), otpValue);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Validate OTP
     */
    public boolean validateOTP(String username, int otpValue) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return false;
            }

            User user = userOptional.get();
            Optional<OTP> otpOptional = otpRepository.findByUserAndOtpValueAndIsUsedFalse(user, otpValue);

            if (otpOptional.isEmpty()) {
                return false;
            }

            OTP otp = otpOptional.get();

            // Check if OTP is expired
            if (otp.isExpired()) {
                return false;
            }

            // Mark OTP as used
            otp.setIsUsed(true);
            otpRepository.save(otp);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Invalidate all unexpired OTPs for a user
     */
    public void invalidateOldOtps(User user) {
        try {
            otpRepository.findByUserAndIsUsedFalse(user).forEach(otp -> {
                otp.setIsUsed(true);
                otpRepository.save(otp);
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Generate random OTP
     */
    private int generateOTP() {
        return 100000 + random.nextInt(900000);
    }

    /**
     * Validate OTP without marking as used (for checking validity)
     */
    public boolean validateOTPWithoutUsing(String username, int otpValue) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return false;
            }

            User user = userOptional.get();
            Optional<OTP> otpOptional = otpRepository.findByUserAndOtpValueAndIsUsedFalse(user, otpValue);

            if (otpOptional.isEmpty()) {
                return false;
            }

            OTP otp = otpOptional.get();
            return !otp.isExpired();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
