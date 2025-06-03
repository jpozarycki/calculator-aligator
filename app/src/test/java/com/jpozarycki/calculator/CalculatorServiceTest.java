package com.jpozarycki.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorServiceTest {
    private CalculatorService calculatorService;

    @BeforeEach
    void setUp() {
        var operationRegistry = new OperationRegistry();
        calculatorService = new CalculatorService(
                new OperationRegistry(),
                new ShuntingYardEvaluator(operationRegistry),
                new BasicExpressionTokenizer(operationRegistry),
                new BasicExpressionValidator());
    }

    @Nested
    @DisplayName("Basic Arithmetic Operations")
    class BasicArithmeticOperations {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/basic-arithmetic.csv", numLinesToSkip = 1)
        @DisplayName("Basic arithmetic: {0} = {1}")
        void testBasicArithmetic(String expression, int expected) {
            assertEquals(expected, calculatorService.calculate(expression));
        }
    }

    @Nested
    @DisplayName("Order of Operations")
    class OrderOfOperations {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/order-of-operations.csv", numLinesToSkip = 1)
        @DisplayName("Order of operations: {0} = {1}")
        void testOrderOfOperations(String expression, int expected) {
            assertEquals(expected, calculatorService.calculate(expression));
        }
    }

    @Nested
    @DisplayName("Negative Numbers")
    class NegativeNumbers {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/negative-numbers.csv", numLinesToSkip = 1)
        @DisplayName("Negative numbers: {0} = {1}")
        void testNegativeNumbers(String expression, int expected) {
            assertEquals(expected, calculatorService.calculate(expression));
        }
    }

    @Nested
    @DisplayName("Complex Expressions")
    class ComplexExpressions {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/complex-expressions.csv", numLinesToSkip = 1)
        @DisplayName("Complex expressions: {0} = {1}")
        void testComplexExpressions(String expression, int expected) {
            assertEquals(expected, calculatorService.calculate(expression));
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/edge-cases.csv", numLinesToSkip = 1)
        @DisplayName("Edge cases: {0} = {1}")
        void testEdgeCases(String expression, int expected) {
            assertEquals(expected, calculatorService.calculate(expression));
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {
        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/invalid-syntax.csv", numLinesToSkip = 1)
        @DisplayName("Invalid syntax: '{0}' should throw IllegalArgumentException")
        void testInvalidSyntaxExpressions(String expression) {
            assertThrows(IllegalArgumentException.class, 
                () -> calculatorService.calculate(expression),
                "Expression '" + expression + "' should throw IllegalArgumentException");
        }

        @ParameterizedTest
        @CsvFileSource(resources = "/calculator/arithmetic-errors.csv", numLinesToSkip = 1)
        @DisplayName("Arithmetic error: '{0}' should throw ArithmeticException")
        void testArithmeticErrors(String expression) {
            assertThrows(ArithmeticException.class, 
                () -> calculatorService.calculate(expression),
                "Expression '" + expression + "' should throw ArithmeticException");
        }
    }

    @Nested
    @DisplayName("Task Examples")
    class TaskExamples {
        @Test
        @DisplayName("Task specific examples")
        void testTaskExamples() {
            // EX1: calculate("2 + 3") should return 5
            assertEquals(5, calculatorService.calculate("2 + 3"));
            
            // EX2: calculate("3 * 2 + 1") should return 7
            assertEquals(7, calculatorService.calculate("3 * 2 + 1"));
            
            // EX3: calculate("3 * -2 + 6") should return 0
            assertEquals(0, calculatorService.calculate("3 * -2 + 6"));
        }
    }
}