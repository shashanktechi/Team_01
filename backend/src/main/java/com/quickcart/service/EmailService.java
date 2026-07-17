package com.quickcart.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        log.info("Sending OTP email from={} to={} with OTP={}", fromAddress, toEmail, otp);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Verify Your QuickCart Account");
            message.setText("Your verification code is: " + otp + "\n\nThis code will expire in 10 minutes.");

            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw e;
        }
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        log.info("Sending password reset OTP email from={} to={}", fromAddress, toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Reset Your QuickCart Password");
            message.setText("We received a request to reset your QuickCart password.\n\n"
                    + "Your verification code is: " + otp
                    + "\n\nThis code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.");

            mailSender.send(message);
            log.info("Successfully sent password reset OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw e;
        }
    }
}