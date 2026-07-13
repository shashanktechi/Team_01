package com.quickcart.repository;

import com.quickcart.entity.Swarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwarmRepository extends JpaRepository<Swarm, Long> {
    List<Swarm> findByDeliveryPartnerId(Long deliveryPartnerId);
}
