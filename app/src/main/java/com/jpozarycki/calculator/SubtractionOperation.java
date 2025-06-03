package com.jpozarycki.calculator;

class SubtractionOperation implements Operation {
    @Override
    public int execute(int left, int right) {
        return left - right;
    }

    @Override
    public String getSymbol() {
        return "-";
    }

    @Override
    public int getPrecedence() {
        return 1;
    }

    @Override
    public boolean isLeftAssociative() {
        return true;
    }
} 