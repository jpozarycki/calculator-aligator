package com.jpozarycki.calculator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Stack;

@Component
@RequiredArgsConstructor
class ShuntingYardEvaluator implements ExpressionEvaluator {
    private final OperationRegistryFacade operationRegistry;

    @Override
    public int evaluate(List<String> tokens) {
        return evaluateWithShuntingYard(tokens);
    }

    private int evaluateWithShuntingYard(List<String> tokens) {
        Stack<Integer> operands = new Stack<>();
        Stack<Operation> operators = new Stack<>();

        for (String token : tokens) {
            if (isNumber(token)) {
                operands.push(Integer.parseInt(token));
            } else if (operationRegistry.isValidOperator(token)) {
                Operation currentOp = operationRegistry.getOperation(token);
                
                while (!operators.isEmpty() && 
                       shouldPopOperator(operators.peek(), currentOp)) {
                    executeOperation(operands, operators.pop());
                }
                operators.push(currentOp);
            }
        }

        while (!operators.isEmpty()) {
            executeOperation(operands, operators.pop());
        }

        return operands.pop();
    }

    private boolean shouldPopOperator(Operation stackOp, Operation currentOp) {
        return stackOp.getPrecedence() > currentOp.getPrecedence() ||
               (stackOp.getPrecedence() == currentOp.getPrecedence() && 
                currentOp.isLeftAssociative());
    }

    private void executeOperation(Stack<Integer> operands, Operation operation) {
        int right = operands.pop();
        int left = operands.pop();
        operands.push(operation.execute(left, right));
    }

    private boolean isNumber(String token) {
        return token.matches("-?\\d+");
    }
} 