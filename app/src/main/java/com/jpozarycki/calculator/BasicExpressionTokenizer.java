package com.jpozarycki.calculator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
class BasicExpressionTokenizer implements ExpressionTokenizer {
    private final OperationRegistry operationRegistry;

    @Override
    public List<String> tokenize(String expression) {
        List<String> tokens = new ArrayList<>();
        String expressionTrimmed = expression.trim();
        
        StringBuilder currentToken = new StringBuilder();
        
        for (int i = 0; i < expressionTrimmed.length(); i++) {
            char ch = expressionTrimmed.charAt(i);
            
            if (ch == ' ') {
                if (!currentToken.isEmpty()) {
                    tokens.add(currentToken.toString());
                    currentToken = new StringBuilder();
                }
                continue;
            }
            
            String charStr = String.valueOf(ch);
            if (operationRegistry.isValidOperator(charStr) && !charStr.equals("-")) {
                if (!currentToken.isEmpty()) {
                    tokens.add(currentToken.toString());
                    currentToken = new StringBuilder();
                }
                tokens.add(charStr);
            } else if (ch == '-') {
                // Handle negative numbers vs minus operator
                if (!currentToken.isEmpty()) {
                    tokens.add(currentToken.toString());
                    currentToken = new StringBuilder();
                    tokens.add(charStr);
                } else if (tokens.isEmpty() || operationRegistry.isValidOperator(tokens.get(tokens.size() - 1))) {
                    // It's a negative number
                    currentToken.append(ch);
                } else {
                    // It's a minus operator
                    tokens.add(charStr);
                }
            } else if (Character.isDigit(ch)) {
                currentToken.append(ch);
            } else {
                throw new IllegalArgumentException("Invalid character in expression. Please use only digits (0-9), operators (+, -, *, /), and spaces.");
            }
        }
        
        if (!currentToken.isEmpty()) {
            tokens.add(currentToken.toString());
        }
        
        return tokens;
    }
} 