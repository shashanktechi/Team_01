package com.quickcart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShelfAnalysisResult {
    private String productGuess;
    private Integer quantityGuess;
}
//
