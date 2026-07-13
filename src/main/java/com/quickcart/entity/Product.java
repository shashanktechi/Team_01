package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.pgvector.PGvector;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(length = 100)
    private String category;

    @Column(name = "unit_price", nullable = false)
    private java.math.BigDecimal unitPrice;

    @Column(name = "image_url")
    private String imageUrl;

    // pgvector column mapping
    @Column(columnDefinition = "vector(384)")
    private PGvector embedding;

    @Column(name = "typical_shelf_life_hours")
    private Integer typicalShelfLifeHours;
}
