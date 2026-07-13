package com.quickcart.dto.request;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long productId;
    private Integer qty;
}
