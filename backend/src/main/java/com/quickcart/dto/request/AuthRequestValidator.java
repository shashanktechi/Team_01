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

        if (!hasEmail) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email is required for login")
                    .addPropertyNode("email")
                    .addConstraintViolation();
            return false;
        }

        // Basic email format validation
        String email = request.getEmail().trim();
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Please provide a valid email address")
                    .addPropertyNode("email")
                    .addConstraintViolation();
            return false;
        }

        if (!hasPassword) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password is required for login")
                    .addPropertyNode("password")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
