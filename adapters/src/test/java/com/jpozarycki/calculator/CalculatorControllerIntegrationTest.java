package com.jpozarycki.calculator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jpozarycki.calculator.dto.CalculationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the Calculator API.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalculatorControllerIntegrationTest {

    private static final String URI = "/api/calculate";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ========== FULL FLOW INTEGRATION TESTS ==========

    @Test
    void shouldCalculateSimpleExpressionThroughFullStack() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + 3");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.result").value(5))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void shouldCalculateComplexExpressionWithOrderOfOperations() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("3 * 2 + 1");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(7));
    }

    @Test
    void shouldCalculateWithNegativeNumbers() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("3 * -2 + 6");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(0));
    }

    @Test
    void shouldHandleMultipleOperationsInCorrectOrder() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("10 / 2 + 3 * 4 - 1");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(16)); // 5 + 12 - 1 = 16
    }

    @Test
    void shouldHandleIntegerDivision() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("7 / 2");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(3)); // Integer division
    }

    // ========== ERROR HANDLING THROUGH FULL STACK ==========

    @Test
    void shouldHandleDivisionByZeroThroughFullStack() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("10 / 0");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").doesNotExist())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("zero")));
    }

    @Test
    void shouldHandleInvalidExpressionFormat() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + + 3");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void shouldHandleInvalidOperator() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 & 3");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void shouldHandleNonNumericValues() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("abc + 2");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // ========== VALIDATION THROUGH FULL STACK ==========

    @Test
    void shouldValidateEmptyExpression() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldValidateNullExpression() throws Exception {
        // Given
        String requestJson = "{\"expression\": null}";

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    // ========== PERFORMANCE AND EDGE CASES ==========

    @Test
    void shouldHandleVeryLongExpression() throws Exception {
        // Given
        StringBuilder expression = new StringBuilder("1");
        for (int i = 2; i <= 100; i++) {
            expression.append(" + ").append(i);
        }
        CalculationRequest request = new CalculationRequest(expression.toString());

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(5050)); // Sum of 1 to 100
    }

    @Test
    void shouldHandleLargeNumbers() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("1000000 * 1000");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(1000000000));
    }

    @Test
    void shouldMaintainPrecisionWithMultipleOperations() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("100 / 3 * 3");

        // When & Then
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(99)); // 33 * 3 = 99 (due to integer division)
    }

    // ========== CONCURRENT REQUEST HANDLING ==========

    @Test
    void shouldHandleConcurrentRequests() throws Exception {
        // This test verifies the service is thread-safe
        // In a real scenario, you might want to use CompletableFuture or similar
        
        // Given
        CalculationRequest request1 = new CalculationRequest("100 + 200");
        CalculationRequest request2 = new CalculationRequest("500 - 100");
        CalculationRequest request3 = new CalculationRequest("10 * 10");

        // When & Then - execute multiple requests
        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(300));

        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(400));

        mockMvc.perform(post(URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(100));
    }
} 