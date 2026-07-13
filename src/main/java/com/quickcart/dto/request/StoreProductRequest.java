package com.quickcart.dto.request;

import com.quickcart.entity.Product;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StoreProductRequest {
    private Product product;
    private Integer quantity;
    private String batchCode;
    private LocalDateTime expiryTime;
}
