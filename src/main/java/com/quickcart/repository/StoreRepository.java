package com.quickcart.repository;

import com.quickcart.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByOwnerId(Long ownerId);

    // Find stores that have all requested product IDs with required quantity
    // For simplicity, we pass a list of product IDs, but checking quantities for multiple products in a single native query requires advanced SQL.
    // We can fetch nearest stores first, and then check inventory, or use a complex native query.
    // We will use a native query to find nearest stores that are open and approved.
    @Query(value = "SELECT * FROM stores s WHERE s.is_open = true AND s.verification_status = 'APPROVED' ORDER BY s.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) ASC", nativeQuery = true)
    List<Store> findNearestStores(@Param("lat") double lat, @Param("lng") double lng);

    List<Store> findByVerificationStatus(String verificationStatus);
}
