package com.quickcart.service;

import com.quickcart.entity.Product;
import com.quickcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubstitutionService {
    
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getSubstitutions(@org.springframework.lang.NonNull Long outOfStockProductId) {
        Product original = productRepository.findById(outOfStockProductId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        // Uses pgvector cosine distance search
        return productRepository.findSimilarProducts(original.getCategory(), original.getId());
    }
}
