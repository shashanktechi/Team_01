package com.quickcart.service;

import com.quickcart.entity.Inventory;
import com.quickcart.entity.Product;
import com.quickcart.entity.Store;
import com.quickcart.repository.InventoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Transactional
    public Inventory addProductToStore(Long storeId, Product product, Integer quantity, String batchCode, LocalDateTime expiryTime) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Product savedProduct;
        if (product.getId() == null) {
            savedProduct = productRepository.save(product);
        } else {
            savedProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
        }

        Inventory inventory = new Inventory();
        inventory.setStore(store);
        inventory.setProduct(savedProduct);
        inventory.setQuantity(quantity);
        inventory.setBatchCode(batchCode != null ? batchCode : "BATCH-" + System.currentTimeMillis());
        inventory.setExpiryTime(expiryTime != null ? expiryTime : LocalDateTime.now().plusHours(
                savedProduct.getTypicalShelfLifeHours() != null ? savedProduct.getTypicalShelfLifeHours() : 72
        ));

        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory updateQuantity(Long inventoryId, Integer quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getInventoryByStore(Long storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }
}
