package calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorServiceTest {
    private CalculatorService calculatorService;

    @BeforeEach
    void setUp() {
        calculatorService = new CalculatorService();
    }

    // Test basic addition
    @Test
    void testSimpleAddition() {
        assertEquals(5, calculatorService.calculate("2 + 3"));
        assertEquals(10, calculatorService.calculate("5 + 5"));
        assertEquals(0, calculatorService.calculate("0 + 0"));
    }

    // Test basic subtraction
    @Test
    void testSimpleSubtraction() {
        assertEquals(2, calculatorService.calculate("5 - 3"));
        assertEquals(-5, calculatorService.calculate("0 - 5"));
        assertEquals(0, calculatorService.calculate("10 - 10"));
    }

    // Test basic multiplication
    @Test
    void testSimpleMultiplication() {
        assertEquals(15, calculatorService.calculate("3 * 5"));
        assertEquals(0, calculatorService.calculate("0 * 100"));
        assertEquals(1, calculatorService.calculate("1 * 1"));
    }

    // Test basic division
    @Test
    void testSimpleDivision() {
        assertEquals(5, calculatorService.calculate("10 / 2"));
        assertEquals(3, calculatorService.calculate("9 / 3"));
        assertEquals(1, calculatorService.calculate("7 / 7"));
    }

    // Test order of operations (multiplication/division before addition/subtraction)
    @Test
    void testOrderOfOperations() {
        assertEquals(7, calculatorService.calculate("3 * 2 + 1"));
        assertEquals(11, calculatorService.calculate("2 + 3 * 3"));
        assertEquals(5, calculatorService.calculate("10 / 2 + 0"));
        assertEquals(9, calculatorService.calculate("12 / 3 + 5"));
        assertEquals(14, calculatorService.calculate("2 + 3 * 4"));
        assertEquals(10, calculatorService.calculate("20 / 2 - 0"));
    }

    // Test with negative numbers
    @Test
    void testNegativeNumbers() {
        assertEquals(0, calculatorService.calculate("3 * -2 + 6"));
        assertEquals(-5, calculatorService.calculate("-2 + -3"));
        assertEquals(6, calculatorService.calculate("-2 * -3"));
        assertEquals(-10, calculatorService.calculate("10 * -1"));
        assertEquals(2, calculatorService.calculate("-4 / -2"));
        assertEquals(-2, calculatorService.calculate("4 / -2"));
    }

    // Test complex expressions
    @Test
    void testComplexExpressions() {
        assertEquals(14, calculatorService.calculate("2 + 3 * 4"));
        assertEquals(8, calculatorService.calculate("2 * 3 + 2"));
        assertEquals(5, calculatorService.calculate("10 / 2 * 1"));
        assertEquals(1, calculatorService.calculate("10 / 2 / 5"));
        assertEquals(7, calculatorService.calculate("1 + 2 * 3"));
        assertEquals(9, calculatorService.calculate("3 * 3 / 1"));
    }

    // Test with multiple operations
    @Test
    void testMultipleOperations() {
        assertEquals(10, calculatorService.calculate("2 + 3 * 4 - 4"));
        assertEquals(3, calculatorService.calculate("10 / 2 - 2"));
        assertEquals(11, calculatorService.calculate("2 * 3 + 5"));
        assertEquals(0, calculatorService.calculate("5 - 10 / 2"));
        assertEquals(7, calculatorService.calculate("1 + 2 + 3 + 1"));
    }

    // Test edge cases with single numbers
    @Test
    void testSingleNumber() {
        assertEquals(5, calculatorService.calculate("5"));
        assertEquals(-5, calculatorService.calculate("-5"));
        assertEquals(0, calculatorService.calculate("0"));
    }

    // Test with extra spaces
    @Test
    void testExtraSpaces() {
        assertEquals(5, calculatorService.calculate("2  +  3"));
        assertEquals(7, calculatorService.calculate("  3 * 2 + 1  "));
        assertEquals(0, calculatorService.calculate("3 *   -2 +   6"));
    }

    // Test division resulting in integer (following Java integer division rules)
    @Test
    void testIntegerDivision() {
        assertEquals(3, calculatorService.calculate("10 / 3")); // 3.33... truncated to 3
        assertEquals(2, calculatorService.calculate("5 / 2"));  // 2.5 truncated to 2
        assertEquals(0, calculatorService.calculate("1 / 2"));  // 0.5 truncated to 0
    }

    // Test division by zero (should throw exception or handle appropriately)
    @Test
    void testDivisionByZero() {
        assertThrows(ArithmeticException.class, () -> calculatorService.calculate("10 / 0"));
        assertThrows(ArithmeticException.class, () -> calculatorService.calculate("5 * 2 / 0"));
    }

    // Test invalid expressions
    @Test
    void testInvalidExpressions() {
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate(""));
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate("2 +"));
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate("+ 2"));
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate("2 + + 3"));
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate("abc"));
        assertThrows(IllegalArgumentException.class, () -> calculatorService.calculate("2 & 3"));
    }

    // Test from the examples in the task
    @Test
    void testTaskExamples() {
        // EX1: calculate("2 + 3") should return 5
        assertEquals(5, calculatorService.calculate("2 + 3"));
        
        // EX2: calculate("3 * 2 + 1") should return 7
        assertEquals(7, calculatorService.calculate("3 * 2 + 1"));
        
        // EX3: calculate("3 * -2 + 6") should return 0
        assertEquals(0, calculatorService.calculate("3 * -2 + 6"));
    }
}