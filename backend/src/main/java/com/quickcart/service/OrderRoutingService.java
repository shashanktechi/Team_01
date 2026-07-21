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

        if (request.getDeliveryAddress() != null && !request.getDeliveryAddress().isEmpty()) {
            customer.setAddress(request.getDeliveryAddress());
            userRepository.save(customer);
        }

        Double lat = request.getCustomerLat();
        Double lng = request.getCustomerLng();

        if (lat == null || lat == 0.0 || lng == null || lng == 0.0) {
            if (!request.getItems().isEmpty()) {
                List<Inventory> itemStock = inventoryRepository.findByProductId(request.getItems().get(0).getProductId());
                if (!itemStock.isEmpty() && itemStock.get(0).getStore() != null && itemStock.get(0).getStore().getLocation() != null) {
                    lat = itemStock.get(0).getStore().getLocation().getY();
                    lng = itemStock.get(0).getStore().getLocation().getX();
                } else {
                    lat = 12.9716;
                    lng = 77.5946;
                }
            } else {
                lat = 12.9716;
                lng = 77.5946;
            }
        }

        // 1. Find nearest stores (fetch up to 50 candidates to check stock)
        List<Store> nearestStores = storeRepository.findNearestStores(lat, lng, 50);

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
        order.setCustomerLat(lat);
        order.setCustomerLng(lng);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus("PENDING");
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
        
        // Calculate estimated delivery time using Haversine formula
        int estimatedTime = 25; // default fallback
        if (selectedStore.getLocation() != null && lat != null && lng != null) {
            double storeLat = selectedStore.getLocation().getY();
            double storeLng = selectedStore.getLocation().getX();
            
            double R = 6371; // Earth radius in km
            double dLat = Math.toRadians(lat - storeLat);
            double dLng = Math.toRadians(lng - storeLng);
            double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                       Math.cos(Math.toRadians(storeLat)) * Math.cos(Math.toRadians(lat)) *
                       Math.sin(dLng/2) * Math.sin(dLng/2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            double distanceKm = R * c;
            
            // Note: This is a temporary interim calculation. If customer coordinates are fallback, use city average.
            // Integrating a real maps API (like Google Maps Distance Matrix) would significantly improve accuracy.
            if (distanceKm < 0.1 || (lat == 12.9716 && lng == 77.5946)) {
                estimatedTime = 30; // City average fallback
            } else {
                int basePrepTime = 10; // minutes
                double avgSpeedKmH = 20.0; // km/h (urban average)
                int travelTimeMins = (int) Math.ceil((distanceKm / avgSpeedKmH) * 60);
                estimatedTime = basePrepTime + travelTimeMins;
            }
        }
        order.setEstimatedDeliveryTime(estimatedTime);
        
        Order savedOrder = orderRepository.save(order);
        if (savedOrder.getStore() != null) {
            notificationService.notifyStore(savedOrder.getStore().getId(), savedOrder);
        }
        return savedOrder;
    }
}
