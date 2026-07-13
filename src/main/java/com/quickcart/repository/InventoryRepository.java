package com.quickcart.repository;

import com.quickcart.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.product.id = :productId AND i.quantity >= :qty")
    List<Inventory> findAvailableStock(@Param("storeId") Long storeId, @Param("productId") Long productId, @Param("qty") Integer qty);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.id = :id")
    Optional<Inventory> findByIdForUpdate(@Param("id") Long id);

    List<Inventory> findByStoreId(Long storeId);
}
