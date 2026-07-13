package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.locationtech.jts.geom.Point;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point location;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "verification_status", length = 50)
    private String verificationStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "freshness_score", precision = 3, scale = 1)
    private Double freshnessScore = 5.0;

    @Column(name = "is_open")
    private Boolean isOpen = true;
}
