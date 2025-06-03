package com.jpozarycki.calculator;

class MultiplicationOperation implements Operation {
    @Override
    public int execute(int left, int right) {
        return left * right;
    }

    @Override
    public String getSymbol() {
        return "*";
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