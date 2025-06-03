package com.jpozarycki.calculator;

interface Operation {
    int execute(int left, int right);
    String getSymbol();
    int getPrecedence();
    boolean isLeftAssociative();
} 