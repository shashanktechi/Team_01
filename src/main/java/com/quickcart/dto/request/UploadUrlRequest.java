package com.quickcart.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UploadUrlRequest {
    @NotBlank(message = "Content type is required")
    @Pattern(regexp = "^image/(jpeg|png|webp)$", message = "Content type must be image/jpeg, image/png, or image/webp")
    private String contentType;
}