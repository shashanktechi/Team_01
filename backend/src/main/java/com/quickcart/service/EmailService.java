package com.quickcart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Verify Your QuickCart Account");
        message.setText("Your verification code is: " + otp + "\n\nThis code will expire in 10 minutes.");

        mailSender.send(message);
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Reset Your QuickCart Password");
        message.setText("We received a request to reset your QuickCart password.\n\n"
                + "Your verification code is: " + otp
                + "\n\nThis code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.");

        mailSender.send(message);
    }
}