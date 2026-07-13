package com.quickcart.service;

import com.quickcart.entity.Inventory;
import com.quickcart.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@SuppressWarnings("null")
public class SchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(SchedulerService.class);

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private NotificationService notificationService;

    // Runs once every hour to flag inventory expiring in the next 24 hours
    @Scheduled(cron = "0 0 * * * *")
    public void flagNearExpiryInventory() {
        logger.info("Starting near-expiry inventory scan...");
        LocalDateTime threshold = LocalDateTime.now().plusHours(24);
        
        List<Inventory> allInventory = inventoryRepository.findAll();
        for (Inventory item : allInventory) {
            if (item.getExpiryTime() != null && item.getExpiryTime().isBefore(threshold) && item.getQuantity() > 0) {
                logger.warn("Inventory alert: Store ID {} product {} (Batch {}) is near expiry (Expiry: {})",
                        item.getStore().getId(), item.getProduct().getName(), item.getBatchCode(), item.getExpiryTime());
                
                Map<String, Object> payload = new HashMap<>();
                payload.put("type", "EXPIRY_WARNING");
                payload.put("productId", item.getProduct().getId());
                payload.put("productName", item.getProduct().getName());
                payload.put("batchCode", item.getBatchCode());
                payload.put("expiryTime", item.getExpiryTime());
                
                notificationService.notifyStore(item.getStore().getId(), payload);
            }
        }
        logger.info("Near-expiry inventory scan complete.");
    }
}
