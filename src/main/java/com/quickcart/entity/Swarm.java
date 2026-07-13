package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "swarms")
public class Swarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_partner_id")
    private User deliveryPartner;

    @Column(name = "order_ids", columnDefinition = "integer[]")
    private List<Long> orderIds;

    @Column(name = "route_polyline")
    private String routePolyline;

    @Column(name = "estimated_completion")
    private LocalDateTime estimatedCompletion;
}
