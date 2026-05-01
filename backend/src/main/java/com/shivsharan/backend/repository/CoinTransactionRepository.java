package com.shivsharan.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shivsharan.backend.model.CoinTransaction;

@Repository
public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, UUID> {
    List<CoinTransaction> findByUser_Id(UUID userId);
}
