package com.jpozarycki.calculator;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
class CalculatorService implements CalculatorFacade {
    
    private static final Pattern NUMBER_PATTERN = Pattern.compile("-?\\d+");
    private static final Pattern OPERATOR_PATTERN = Pattern.compile("[+\\-*/]");
    
    @Override
    public int calculate(final String expression) {
        if (expression == null || expression.trim().isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be empty");
        }
        
        List<String> tokens = tokenize(expression);
        validateTokens(tokens);
        return evaluateExpression(tokens);
    }
    
    private List<String> tokenize(String expression) {
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
            
            if (ch == '+' || ch == '*' || ch == '/') {
                if (!currentToken.isEmpty()) {
                    tokens.add(currentToken.toString());
                    currentToken = new StringBuilder();
                }
                tokens.add(String.valueOf(ch));
            } else if (ch == '-') {
                // Check if it's a negative number or minus operator
                if (!currentToken.isEmpty()) {
                    tokens.add(currentToken.toString());
                    currentToken = new StringBuilder();
                    tokens.add(String.valueOf(ch));
                } else if (tokens.isEmpty() || isOperator(tokens.get(tokens.size() - 1))) {
                    // It's a negative number
                    currentToken.append(ch);
                } else {
                    // It's a minus operator
                    tokens.add(String.valueOf(ch));
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
    
    private void validateTokens(List<String> tokens) {
        if (tokens.isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be empty");
        }
        
        // First token must be a number
        if (isNotANumber(tokens.get(0))) {
            throw new IllegalArgumentException("Expression must start with a number");
        }
        
        // Last token must be a number
        if (isNotANumber(tokens.get(tokens.size() - 1))) {
            throw new IllegalArgumentException("Expression must end with a number");
        }
        
        // Check alternating pattern: number-operator-number
        for (int i = 0; i < tokens.size(); i++) {
            String token = tokens.get(i);
            if (i % 2 == 0) {
                // Even positions should be numbers
                if (isNotANumber(token)) {
                    throw new IllegalArgumentException("Invalid expression: expected number at position " + i);
                }
            } else {
                // Odd positions should be operators
                if (!isOperator(token)) {
                    throw new IllegalArgumentException("Invalid expression: expected operator at position " + i);
                }
            }
        }
    }
    
    private int evaluateExpression(List<String> tokens) {
        // Convert tokens to numbers and operators lists
        List<Integer> numbers = new ArrayList<>();
        List<String> operators = new ArrayList<>();
        
        for (int i = 0; i < tokens.size(); i++) {
            if (i % 2 == 0) {
                numbers.add(Integer.parseInt(tokens.get(i)));
            } else {
                operators.add(tokens.get(i));
            }
        }
        
        // First pass: Handle multiplication and division
        int i = 0;
        while (i < operators.size()) {
            String op = operators.get(i);
            if (op.equals("*") || op.equals("/")) {
                int left = numbers.get(i);
                int right = numbers.get(i + 1);
                int result;
                
                if (op.equals("*")) {
                    result = left * right;
                } else {
                    if (right == 0) {
                        throw new ArithmeticException("Division by zero");
                    }
                    result = left / right;
                }
                
                // Replace the two numbers and operator with the result
                numbers.set(i, result);
                numbers.remove(i + 1);
                operators.remove(i);
                // Don't increment i, check the same position again
            } else {
                i++;
            }
        }
        
        // Second pass: Handle addition and subtraction
        i = 0;
        while (i < operators.size()) {
            String op = operators.get(i);
            int left = numbers.get(i);
            int right = numbers.get(i + 1);
            int result;
            
            if (op.equals("+")) {
                result = left + right;
            } else { // op.equals("-")
                result = left - right;
            }
            
            // Replace the two numbers and operator with the result
            numbers.set(i, result);
            numbers.remove(i + 1);
            operators.remove(i);
            // Don't increment i, check the same position again
        }
        
        return numbers.get(0);
    }
    
    private boolean isOperator(String token) {
        return OPERATOR_PATTERN.matcher(token).matches();
    }
    
    private boolean isNotANumber(String token) {
        return !NUMBER_PATTERN.matcher(token).matches();
    }
}
