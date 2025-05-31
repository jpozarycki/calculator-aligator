package com.jpozarycki.calculator.dto;

import jakarta.validation.constraints.NotBlank;

public record CalculationRequest(@NotBlank String expression) {
}
