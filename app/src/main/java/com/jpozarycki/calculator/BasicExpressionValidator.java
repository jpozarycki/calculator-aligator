package com.jpozarycki.calculator;

import org.springframework.stereotype.Component;
import java.util.List;

import static com.jpozarycki.calculator.util.NumberUtil.isNumber;

@Component
class BasicExpressionValidator implements ExpressionValidator {

    @Override
    public void validate(List<String> tokens, OperationRegistryFacade registry) {
        if (tokens.isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be empty");
        }

        // Validate first and last tokens
        if (!isNumber(tokens.get(0))) {
            throw new IllegalArgumentException("Expression must start with a number");
        }
        
        if (!isNumber(tokens.get(tokens.size() - 1))) {
            throw new IllegalArgumentException("Expression must end with a number");
        }

        // Validate alternating pattern
        for (int i = 0; i < tokens.size(); i++) {
            String token = tokens.get(i);
            if (i % 2 == 0) {
                if (!isNumber(token)) {
                    throw new IllegalArgumentException("Invalid expression: expected number at position " + i);
                }
            } else {
                if (!registry.isValidOperator(token)) {
                    throw new IllegalArgumentException("Invalid expression: expected operator at position " + i);
                }
            }
        }
    }

} 