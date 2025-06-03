package com.jpozarycki.calculator;

interface OperationRegistryFacade {
    void register(Operation operation);
    Operation getOperation(String symbol);
    boolean isValidOperator(String symbol);
}
