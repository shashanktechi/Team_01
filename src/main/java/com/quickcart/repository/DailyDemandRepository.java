package com.quickcart.repository;

import com.quickcart.entity.DailyDemand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyDemandRepository extends JpaRepository<DailyDemand, Long> {
    List<DailyDemand> findByStoreIdAndDateBetween(Long storeId, LocalDate start, LocalDate end);
}