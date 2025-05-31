package com.jpozarycki.calculator;

import calculator.CalculatorFacade;
import com.jpozarycki.calculator.dto.CalculationRequest;
import com.jpozarycki.calculator.dto.CalculationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/calculate")
class CalculatorController {
    private final CalculatorFacade calculatorFacade;

    @PostMapping
    ResponseEntity<CalculationResponse> calculate(@RequestBody @Valid CalculationRequest request) {
        return null;
    }
}
