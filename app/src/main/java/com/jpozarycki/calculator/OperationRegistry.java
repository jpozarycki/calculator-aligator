package com.jpozarycki.calculator;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
class OperationRegistry implements OperationRegistryFacade {
    private final Map<String, Operation> operations;

    OperationRegistry() {
        operations = new HashMap<>();
        registerDefaultOperations();
    }

    public void register(Operation operation) {
        operations.put(operation.getSymbol(), operation);
    }

    public Operation getOperation(String symbol) {
        Operation operation = operations.get(symbol);
        if (operation == null) {
            throw new IllegalArgumentException("Unknown operator: " + symbol);
        }
        return operation;
    }

    public boolean isValidOperator(String symbol) {
        return operations.containsKey(symbol);
    }

    private void registerDefaultOperations() {
        register(new AdditionOperation());
        register(new SubtractionOperation());
        register(new MultiplicationOperation());
        register(new DivisionOperation());
    }
} 