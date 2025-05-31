package com.jpozarycki.calculator;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

/**
 * Test configuration for integration tests in the adapters module.
 * This configuration is used when running @SpringBootTest tests.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(basePackages = {"com.jpozarycki.calculator", "calculator"})
public class TestConfiguration {
} 