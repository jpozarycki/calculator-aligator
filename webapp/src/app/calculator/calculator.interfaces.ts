// Request DTO
export interface CalculationRequest {
  expression: string;
}

// Response DTO
export interface CalculationResponse {
  result: number | null;
  error: string | null;
}

// Component state management interface
export interface CalculatorState {
  result: number | null;
  errorMessage: string;
  isLoading: boolean;
}

// Form validation errors interface
export interface ValidationErrors {
  [key: string]: any;
} 