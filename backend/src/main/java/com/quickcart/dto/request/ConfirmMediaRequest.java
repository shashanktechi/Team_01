package com.quickcart.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmMediaRequest {
    @NotBlank(message = "objectKey is required")
    private String objectKey;
}
//
