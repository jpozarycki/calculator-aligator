package com.jpozarycki.calculator;

class DivisionOperation implements Operation {
    @Override
    public int execute(int left, int right) {
        if (right == 0) {
            throw new ArithmeticException("Division by zero");
        }
        return left / right;
    }

    @Override
    public String getSymbol() {
        return "/";
    }

    @Override
    public int getPrecedence() {
        return 2;
    }

    @Override
    public boolean isLeftAssociative() {
        return true;
    }
} 