package com.quickcart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProofOfDeliveryVerificationResult {
    private boolean isApproved;
    private String reason;
    private boolean requiresAdminReview;
}
//
