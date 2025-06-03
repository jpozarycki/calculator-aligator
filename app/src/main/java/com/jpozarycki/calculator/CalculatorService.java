package com.jpozarycki.calculator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
class CalculatorService implements CalculatorFacade {
    
    private final OperationRegistryFacade operationRegistry;
    private final ExpressionEvaluator evaluator;
    private final ExpressionTokenizer tokenizer;
    private final ExpressionValidator validator;

    @Override
    public int calculate(final String expression) {
        if (expression == null || expression.trim().isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be empty");
        }
        
        List<String> tokens = tokenizer.tokenize(expression);
        validator.validate(tokens, operationRegistry);
        return evaluator.evaluate(tokens);
    }
}
