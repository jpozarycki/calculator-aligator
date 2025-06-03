package com.jpozarycki.calculator;

import java.util.List;

interface ExpressionValidator {
    void validate(List<String> tokens, OperationRegistryFacade registry);
} 