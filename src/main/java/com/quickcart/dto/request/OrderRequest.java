package com.quickcart.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private List<OrderItemDto> items;
    private String deliveryAddress;
    private Double customerLat;
    private Double customerLng;
}
