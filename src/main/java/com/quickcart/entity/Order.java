package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_partner_id")
    private User deliveryPartner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swarm_id")
    private Swarm swarm;

    @Column(nullable = false, length = 50)
    private String status; // PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED, REFUNDED

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "customer_lat")
    private Double customerLat;

    @Column(name = "customer_lng")
    private Double customerLng;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "estimated_delivery_time")
    private Integer estimatedDeliveryTime;
}
