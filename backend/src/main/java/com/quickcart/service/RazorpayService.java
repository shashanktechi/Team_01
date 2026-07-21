package com.quickcart.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
@Service
public class RazorpayService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    public Order createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
        JSONObject orderRequest = new JSONObject();
        // Amount is in paise (multiply by 100)
        orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);

        return razorpay.orders.create(orderRequest);
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
