package com.shivsharan.backend.repository;


import com.shivsharan.backend.model.CompanyTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyTagRepository extends JpaRepository<CompanyTag, Long> {
}
