package com.quickcart.repository;

import com.quickcart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find top 3 semantically similar products in the same category
    @Query(value = "SELECT p.* FROM products p WHERE p.category = :category AND p.id != :excludeId ORDER BY p.embedding <-> (SELECT embedding FROM products WHERE id = :excludeId) LIMIT 3", nativeQuery = true)
    List<Product> findSimilarProducts(@Param("category") String category, @Param("excludeId") Long excludeId);
}
