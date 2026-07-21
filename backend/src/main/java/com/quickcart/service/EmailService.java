package com.quickcart.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

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
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your QuickCart Account");
            
            String htmlMsg = getHtmlTemplate("Account Verification", "Your verification code is:", otp, "This code will expire in 10 minutes.");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        log.info("Sending password reset OTP email from={} to={}", fromAddress, toEmail);
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your QuickCart Password");
            
            String htmlMsg = getHtmlTemplate(
                "Password Reset", 
                "We received a request to reset your QuickCart password. Your verification code is:", 
                otp, 
                "This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email."
            );
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Successfully sent password reset OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendVerificationRejectionEmail(String toEmail, String reason, String subject, String title, String bodyText) {
        log.info("Sending verification rejection email from={} to={} with reason={}", fromAddress, toEmail, reason);
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            String htmlMsg = getHtmlTemplate(
                title, 
                bodyText, 
                reason != null && !reason.trim().isEmpty() ? reason : "Please review your submitted documents and re-upload.", 
                "If you have any questions, please contact our support team."
            );
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Successfully sent verification rejection email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification rejection email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendVerificationRejectionEmail(String toEmail, String roleLabel, String reason) {
        log.info("Sending verification rejection email from={} to={} with roleLabel={} and reason={}", fromAddress, toEmail, roleLabel, reason);
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your QuickCart " + roleLabel + " Verification Needs Attention");
            
            String displayReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Please review your submitted documents and try again.";
            String htmlMsg = getHtmlTemplate(
                roleLabel + " Rejection", 
                "We regret to inform you that your application as a " + roleLabel + " has been rejected for the following reason:", 
                displayReason, 
                "If you have any questions, please contact our support team."
            );
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Successfully sent verification rejection email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification rejection email to {} using fromAddress={}: {}", toEmail, fromAddress, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String getHtmlTemplate(String title, String message, String otp, String footer) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<style>"
                + "  body { font-family: 'Inter', sans-serif; background-color: #F3EDE1; margin: 0; padding: 40px; color: #1F2A24; }"
                + "  .container { max-width: 500px; margin: 0 auto; background-color: #FFFDF8; border-radius: 12px; border: 1px dashed rgba(31, 42, 36, 0.2); overflow: hidden; }"
                + "  .header { background-color: #0F5132; color: #FFFDF8; padding: 24px; text-align: center; border-bottom: 4px solid #E8A33D; }"
                + "  .header h1 { margin: 0; font-family: 'Fraunces', serif; font-size: 24px; letter-spacing: -0.5px; }"
                + "  .content { padding: 32px 24px; text-align: center; }"
                + "  .message { font-size: 16px; margin-bottom: 24px; line-height: 1.5; }"
                + "  .otp-box { background-color: #F3EDE1; display: inline-block; padding: 16px 32px; border-radius: 8px; border: 2px dashed #0F5132; margin-bottom: 24px; }"
                + "  .otp { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: bold; color: #0F5132; margin: 0; }"
                + "  .footer { font-size: 13px; color: rgba(31, 42, 36, 0.6); margin-top: 32px; border-top: 1px solid rgba(31, 42, 36, 0.1); padding-top: 16px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "  <div class='container'>"
                + "    <div class='header'>"
                + "      <h1>" + title + "</h1>"
                + "    </div>"
                + "    <div class='content'>"
                + "      <div class='message'>" + message + "</div>"
                + "      <div class='otp-box'>"
                + "        <p class='otp'>" + otp + "</p>"
                + "      </div>"
                + "      <div class='footer'>" + footer + "</div>"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }
}