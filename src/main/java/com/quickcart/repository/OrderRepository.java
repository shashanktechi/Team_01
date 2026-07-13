package com.quickcart.repository;

import com.quickcart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT o.id FROM orders o " +
                   "JOIN stores s ON o.store_id = s.id " +
                   "WHERE o.status = 'PENDING' " +
                   "ORDER BY s.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) ASC " +
                   "LIMIT 3", nativeQuery = true)
    List<Long> findPendingOrderIdsNear(@Param("lat") double lat, @Param("lng") double lng);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id IN :ids")
    List<Order> findByIdInForUpdate(@Param("ids") List<Long> ids);

    List<Order> findByDeliveryPartnerId(Long deliveryPartnerId);
}
