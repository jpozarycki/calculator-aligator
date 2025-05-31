package com.jpozarycki.calculator;

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
@RequestMapping("/api/calculate")
class CalculatorController {
    private final CalculatorFacade calculatorFacade;

    @PostMapping
    ResponseEntity<CalculationResponse> calculate(@RequestBody @Valid CalculationRequest request) {
        try {
            String expression = request.expression();
            int result = calculatorFacade.calculate(expression);
            CalculationResponse response = new CalculationResponse(result, null);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | ArithmeticException e) {
            CalculationResponse response = new CalculationResponse(null, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            CalculationResponse response = new CalculationResponse(null, "Invalid expression");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
