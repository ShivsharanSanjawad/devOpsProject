package com.shivsharan.backend.repository;
import com.shivsharan.backend.model.College;
import com.shivsharan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Count users with higher rating (for global rank)
    @Query("SELECT COUNT(u) + 1 FROM User u WHERE u.rating > :rating")
    Integer findGlobalRank(@Param("rating") Integer rating);
    
    // Count users from same college with higher rating (for college rank)
    @Query("SELECT COUNT(u) + 1 FROM User u WHERE u.college = :college AND u.rating > :rating")
    Integer findCollegeRank(@Param("college") College college, @Param("rating") Integer rating);
    
    // Count total users in college
    @Query("SELECT COUNT(u) FROM User u WHERE u.college = :college")
    Integer countByCollege(@Param("college") College college);
}
