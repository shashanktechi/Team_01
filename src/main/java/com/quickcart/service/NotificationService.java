package com.quickcart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyCustomer(
            @org.springframework.lang.NonNull Long userId,
            @org.springframework.lang.NonNull Object payload) {
        messagingTemplate.convertAndSend("/topic/customer/" + userId, payload);
    }

    public void notifyStore(
            @org.springframework.lang.NonNull Long storeId,
            @org.springframework.lang.NonNull Object payload) {
        messagingTemplate.convertAndSend("/topic/store/" + storeId, payload);
    }

    public void notifyDelivery(
            @org.springframework.lang.NonNull Long partnerId,
            @org.springframework.lang.NonNull Object payload) {
        messagingTemplate.convertAndSend("/topic/delivery/" + partnerId, payload);
    }
}
