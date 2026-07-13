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

    @Transactional
    @SuppressWarnings("null")
    public Swarm batchOrdersForDelivery(@org.springframework.lang.NonNull Long deliveryPartnerId, double currentLat, double currentLng) {
        User partner = userRepository.findById(deliveryPartnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        // Dummy logic: fetch pending orders and assign to a swarm
        List<Order> pendingOrders = orderRepository.findAll().stream()
                .filter(o -> "PENDING".equals(o.getStatus()))
                .limit(3)
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
            orderRepository.save(order);
        }

        return swarm;
    }
}
