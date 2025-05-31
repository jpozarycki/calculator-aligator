// Request DTO
export interface CalculationRequest {
  expression: string;
}

// Response DTO
export interface CalculationResponse {
  result: number | null;
  error: string | null;
} 