package com.jpozarycki.calculator;

import calculator.CalculatorFacade;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jpozarycki.calculator.dto.CalculationRequest;
import com.jpozarycki.calculator.dto.CalculationResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(CalculatorController.class)
class CalculatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CalculatorFacade calculatorFacade;

    // ========== SUCCESSFUL CALCULATION SCENARIOS ==========

    @Test
    void shouldCalculateSimpleAddition() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + 3");
        when(calculatorFacade.calculate("2 + 3")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.result").value(5))
                .andExpect(jsonPath("$.error").doesNotExist());

        verify(calculatorFacade).calculate("2 + 3");
    }

    @Test
    void shouldCalculateComplexExpression() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("3 * 2 + 1");
        when(calculatorFacade.calculate("3 * 2 + 1")).thenReturn(7);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(7))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void shouldCalculateWithNegativeNumbers() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("3 * -2 + 6");
        when(calculatorFacade.calculate("3 * -2 + 6")).thenReturn(0);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(0))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void shouldHandleExpressionWithExtraSpaces() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("  2   +   3  ");
        when(calculatorFacade.calculate("  2   +   3  ")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(5));
    }

    // ========== VALIDATION ERROR SCENARIOS ==========

    @Test
    void shouldReturnBadRequestWhenExpressionIsNull() throws Exception {
        // Given
        String requestJson = "{\"expression\": null}";

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    @Test
    void shouldReturnBadRequestWhenExpressionIsEmpty() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("");

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    @Test
    void shouldReturnBadRequestWhenExpressionIsBlank() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("   ");

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    @Test
    void shouldReturnBadRequestWhenRequestBodyIsMissing() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    @Test
    void shouldReturnBadRequestWhenRequestIsInvalidJson() throws Exception {
        // Given
        String invalidJson = "{\"expression\": }";

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    // ========== ERROR HANDLING SCENARIOS ==========

    @Test
    void shouldHandleArithmeticExceptionForDivisionByZero() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("10 / 0");
        when(calculatorFacade.calculate("10 / 0")).thenThrow(new ArithmeticException("Division by zero"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").doesNotExist())
                .andExpect(jsonPath("$.error").value("Division by zero"));
    }

    @Test
    void shouldHandleIllegalArgumentExceptionForInvalidExpression() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + + 3");
        when(calculatorFacade.calculate("2 + + 3")).thenThrow(new IllegalArgumentException("Invalid expression"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").doesNotExist())
                .andExpect(jsonPath("$.error").value("Invalid expression"));
    }

    @Test
    void shouldHandleUnexpectedRuntimeException() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + 3");
        when(calculatorFacade.calculate("2 + 3")).thenThrow(new RuntimeException("Unexpected error"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.result").doesNotExist())
                .andExpect(jsonPath("$.error").value("Unexpected error"));
    }

    // ========== CONTENT NEGOTIATION SCENARIOS ==========

    @Test
    void shouldRejectRequestWithInvalidContentType() throws Exception {
        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.TEXT_PLAIN)
                .content("2 + 3"))
                .andExpect(status().isUnsupportedMediaType());

        verify(calculatorFacade, never()).calculate(anyString());
    }

    @Test
    void shouldAcceptRequestWithoutExplicitAcceptHeader() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + 3");
        when(calculatorFacade.calculate("2 + 3")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void shouldAcceptRequestWithJsonAcceptHeader() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 + 3");
        when(calculatorFacade.calculate("2 + 3")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    // ========== HTTP METHOD SCENARIOS ==========

    @Test
    void shouldRejectGetRequest() throws Exception {
        mockMvc.perform(get("/calculate"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldRejectPutRequest() throws Exception {
        mockMvc.perform(put("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CalculationRequest("2 + 3"))))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldRejectDeleteRequest() throws Exception {
        mockMvc.perform(delete("/calculate"))
                .andExpect(status().isMethodNotAllowed());
    }

    // ========== EDGE CASES ==========

    @Test
    void shouldHandleLargeNumbers() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2147483647 + 0");
        when(calculatorFacade.calculate("2147483647 + 0")).thenReturn(Integer.MAX_VALUE);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(Integer.MAX_VALUE));
    }

    @Test
    void shouldHandleIntegerOverflow() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2147483647 + 1");
        when(calculatorFacade.calculate("2147483647 + 1")).thenThrow(new ArithmeticException("Integer overflow"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Integer overflow"));
    }

    @Test
    void shouldHandleVeryLongExpression() throws Exception {
        // Given
        String longExpression = "1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10";
        CalculationRequest request = new CalculationRequest(longExpression);
        when(calculatorFacade.calculate(longExpression)).thenReturn(55);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(55));
    }

    @Test
    void shouldHandleSpecialCharactersInExpression() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("2 & 3");
        when(calculatorFacade.calculate("2 & 3")).thenThrow(new IllegalArgumentException("Invalid operator: &"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid operator: &"));
    }

    // ========== REQUEST/RESPONSE FORMAT SCENARIOS ==========

    @Test
    void shouldHandleExtraFieldsInRequest() throws Exception {
        // Given - request with extra field that should be ignored
        String requestJson = "{\"expression\": \"2 + 3\", \"extraField\": \"ignored\"}";
        when(calculatorFacade.calculate("2 + 3")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(5));
    }

    @Test
    void shouldReturnProperJsonStructure() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("10 - 5");
        when(calculatorFacade.calculate("10 - 5")).thenReturn(5);

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap())
                .andExpect(jsonPath("$.result").isNumber())
                .andExpect(jsonPath("$.error").doesNotExist())
                .andExpect(jsonPath("$", aMapWithSize(1))); // Only result field when successful
    }

    @Test
    void shouldReturnProperErrorJsonStructure() throws Exception {
        // Given
        CalculationRequest request = new CalculationRequest("invalid");
        when(calculatorFacade.calculate("invalid")).thenThrow(new IllegalArgumentException("Cannot parse expression"));

        // When & Then
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").isMap())
                .andExpect(jsonPath("$.error").isString())
                .andExpect(jsonPath("$.result").doesNotExist())
                .andExpect(jsonPath("$", aMapWithSize(1))); // Only error field when failed
    }
}