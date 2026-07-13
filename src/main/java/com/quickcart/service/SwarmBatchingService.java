package com.quickcart.service;

import com.quickcart.entity.Order;
import com.quickcart.entity.Swarm;
import com.quickcart.entity.User;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.SwarmRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SwarmBatchingService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SwarmRepository swarmRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    @SuppressWarnings("null")
    public Swarm batchOrdersForDelivery(@org.springframework.lang.NonNull Long deliveryPartnerId, double currentLat, double currentLng) {
        User partner = userRepository.findById(deliveryPartnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        // 1. Fetch nearest pending order IDs
        List<Long> ids = orderRepository.findPendingOrderIdsNear(currentLat, currentLng);
        if (ids.isEmpty()) {
            return null;
        }

        // 2. Fetch and acquire pessimistic write lock on those orders
        List<Order> lockedOrders = orderRepository.findByIdInForUpdate(ids);

        // 3. Filter only those that are still PENDING (double check to prevent race conditions)
        List<Order> pendingOrders = lockedOrders.stream()
                .filter(o -> "PENDING".equals(o.getStatus()))
                .collect(Collectors.toList());

        if (pendingOrders.isEmpty()) {
            return null;
        }

        Swarm swarm = new Swarm();
        swarm.setDeliveryPartner(partner);
        swarm.setOrderIds(pendingOrders.stream().map(Order::getId).collect(Collectors.toList()));
        swarm.setRoutePolyline("encoded_polyline_mock");
        swarm.setEstimatedCompletion(LocalDateTime.now().plusMinutes(45));
        swarm = swarmRepository.save(swarm);

        for (Order order : pendingOrders) {
            order.setSwarm(swarm);
            order.setDeliveryPartner(partner);
            order.setStatus("CONFIRMED");
            Order savedOrder = orderRepository.save(order);
            if (savedOrder.getCustomer() != null) {
                notificationService.notifyCustomer(savedOrder.getCustomer().getId(), savedOrder);
            }
        }

        notificationService.notifyDelivery(deliveryPartnerId, swarm);

        return swarm;
    }
}
