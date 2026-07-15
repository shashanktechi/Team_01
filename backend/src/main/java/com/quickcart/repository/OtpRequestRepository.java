package com.quickcart.repository;

import com.quickcart.entity.OtpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OtpRequestRepository extends JpaRepository<OtpRequest, Long> {
    Optional<OtpRequest> findByEmail(String email);
    long countByEmailAndCreatedAtAfter(String email, Instant dateTime);
    void deleteByEmail(String email);
}