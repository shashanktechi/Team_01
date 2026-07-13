package com.quickcart.service;

import com.quickcart.dto.request.OrderRequest;
import com.quickcart.dto.request.OrderItemDto;
import com.quickcart.entity.Inventory;
import com.quickcart.entity.Order;
import com.quickcart.entity.OrderItem;
import com.quickcart.entity.Store;
import com.quickcart.entity.User;
import com.quickcart.repository.InventoryRepository;
import com.quickcart.repository.OrderItemRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.StoreRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@SuppressWarnings("null")
public class OrderRoutingService {

    @Autowired
    private StoreRepository storeRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Order routeOrder(
            @org.springframework.lang.NonNull Long customerId,
            @org.springframework.lang.NonNull OrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // 1. Find nearest stores
        List<Store> nearestStores = storeRepository.findNearestStores(request.getCustomerLat(), request.getCustomerLng());

        Store selectedStore = null;

        // 2. Iterate and find the first store that has all items in stock
        for (Store store : nearestStores) {
            boolean hasAllStock = true;
            for (OrderItemDto item : request.getItems()) {
                List<Inventory> stock = inventoryRepository.findAvailableStock(store.getId(), item.getProductId(), item.getQty());
                if (stock.isEmpty()) {
                    hasAllStock = false;
                    break;
                }
            }
            if (hasAllStock) {
                selectedStore = store;
                break;
            }
        }

        if (selectedStore == null) {
            throw new RuntimeException("No store has all items in stock nearby.");
        }

        // 3. Reserve stock (using pessimistic locking)
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomer(customer);
        order.setStore(selectedStore);
        order.setStatus("PENDING");
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setCustomerLat(request.getCustomerLat());
        order.setCustomerLng(request.getCustomerLng());
        order = orderRepository.save(order);

        for (OrderItemDto item : request.getItems()) {
            List<Inventory> stocks = inventoryRepository.findAvailableStock(selectedStore.getId(), item.getProductId(), item.getQty());
            Inventory stock = inventoryRepository.findByIdForUpdate(stocks.get(0).getId())
                    .orElseThrow(() -> new RuntimeException("Concurrent stock update failed"));
            
            stock.setQuantity(stock.getQuantity() - item.getQty());
            inventoryRepository.save(stock);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(stock.getProduct());
            orderItem.setQuantity(item.getQty());
            orderItem.setUnitPrice(stock.getProduct().getUnitPrice());
            orderItemRepository.save(orderItem);
            
            totalAmount = totalAmount.add(stock.getProduct().getUnitPrice().multiply(BigDecimal.valueOf(item.getQty())));
        }

        order.setTotalAmount(totalAmount);
        order.setEstimatedDeliveryTime(25); // simple mock for now
        Order savedOrder = orderRepository.save(order);
        if (savedOrder.getStore() != null) {
            notificationService.notifyStore(savedOrder.getStore().getId(), savedOrder);
        }
        return savedOrder;
    }
}
