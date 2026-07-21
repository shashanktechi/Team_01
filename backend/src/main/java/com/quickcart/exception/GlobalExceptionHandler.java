package com.quickcart.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("message", "Validation failed.");
        body.put("error", "Validation failed.");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = (error instanceof FieldError) ? ((FieldError) error).getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        body.put("errors", errors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationExceptions(ConstraintViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("message", "Constraint violation.");
        body.put("error", "Constraint violation.");

        Map<String, String> errors = new HashMap<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        body.put("errors", errors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationExceptions(org.springframework.dao.DataIntegrityViolationException ex) {
        logger.error("Database integrity violation: ", ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());

        Throwable rootCause = ex.getRootCause();
        String rootMsg = rootCause != null ? rootCause.getMessage() : ex.getMessage();
        String userFriendlyMessage = "A database conflict occurred.";

        if (rootMsg != null) {
            if (rootMsg.contains("otp_requests_email_key") || rootMsg.contains("otp_requests")) {
                userFriendlyMessage = "An OTP was already requested for this email. Please wait a moment before trying again.";
            } else if (rootMsg.contains("password_reset_tokens_email_key") || rootMsg.contains("password_reset_tokens")) {
                userFriendlyMessage = "A password reset was already requested for this email. Please wait a moment before trying again.";
            } else if (rootMsg.contains("users_email_key") || rootMsg.contains("users.email")) {
                userFriendlyMessage = "An account with this email address already exists.";
            } else if (rootMsg.contains("users_phone_key")) {
                userFriendlyMessage = "An account with this phone number already exists.";
            }
        }
        body.put("message", userFriendlyMessage);
        body.put("error", userFriendlyMessage);

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeExceptions(RuntimeException ex) {
        logger.error("Runtime exception occurred: " + ex.getMessage(), ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        
        String message = ex.getMessage();
        body.put("message", message);
        body.put("error", message);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (message != null) {
            String messageLower = message.toLowerCase();
            if (ex instanceof IllegalArgumentException || 
                messageLower.contains("invalid") || 
                messageLower.contains("required") || 
                messageLower.contains("must be")) {
                status = HttpStatus.BAD_REQUEST;
            } else if (messageLower.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }
        } else if (ex instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
        }
        body.put("status", status.value());

        return new ResponseEntity<>(body, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex) {
        logger.error("Unexpected error occurred: ", ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("message", "An unexpected error occurred. Please contact system administrator.");
        body.put("error", "An unexpected error occurred. Please contact system administrator.");

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}