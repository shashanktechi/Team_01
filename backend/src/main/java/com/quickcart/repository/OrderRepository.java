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

    List<Order> findByStoreIdAndStatus(Long storeId, String status);

    List<Order> findByCustomerId(Long customerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status NOT IN ('DELIVERED', 'CANCELLED', 'REFUNDED')")
    long countActiveOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal sumGrossTransactionValue();

    @Query(value = "SELECT DATE(o.created_at) as date, SUM(o.total_amount) as totalAmount " +
                   "FROM orders o " +
                   "WHERE o.status = 'DELIVERED' AND o.created_at >= CURRENT_DATE - CAST(:days || ' days' AS INTERVAL) " +
                   "GROUP BY DATE(o.created_at) " +
                   "ORDER BY DATE(o.created_at) ASC", nativeQuery = true)
    List<java.util.Map<String, Object>> findRevenueTrend(@Param("days") int days);
}
