package com.quickcart.dto.request;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AuthRequestValidator implements ConstraintValidator<ValidAuthRequest, AuthRequest> {

    @Override
    public boolean isValid(AuthRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }

        boolean hasPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty();
        boolean hasEmail = request.getEmail() != null && !request.getEmail().trim().isEmpty();
        boolean hasUsername = request.getUsername() != null && !request.getUsername().trim().isEmpty();

        if (!hasEmail && !hasUsername) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email or Username is required for login")
                    .addPropertyNode("email")
                    .addConstraintViolation();
            return false;
        }

        if (hasEmail) {
            String email = request.getEmail().trim();
            if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Please provide a valid email address")
                        .addPropertyNode("email")
                        .addConstraintViolation();
                return false;
            }
        }

        boolean hasOtp = request.getOtp() != null && !request.getOtp().trim().isEmpty();

        if (!hasPassword && !hasOtp) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Either password or OTP is required for login")
                    .addPropertyNode("password")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
