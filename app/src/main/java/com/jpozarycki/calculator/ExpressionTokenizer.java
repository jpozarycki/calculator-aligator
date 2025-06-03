package com.jpozarycki.calculator;

import java.util.List;

interface ExpressionTokenizer {
    List<String> tokenize(String expression);
} 