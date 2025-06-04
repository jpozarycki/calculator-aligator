import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError, timer } from 'rxjs';
import { CalculationRequest, CalculationResponse } from './calculator.interfaces';

// Abstract service interface for dependency inversion
export abstract class CalculatorService {
  abstract calculateExpression(expression: string): Observable<CalculationResponse>;
}

// Configuration interface for service
export interface CalculatorServiceConfig {
  apiEndpoint: string;
  retryAttempts: number;
  retryDelay: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalculatorHttpService extends CalculatorService {
  private readonly config: CalculatorServiceConfig = {
    apiEndpoint: '/api/calculate',
    retryAttempts: 3,
    retryDelay: 1000
  };

  constructor(private http: HttpClient) {
    super();
  }

  calculateExpression(expression: string): Observable<CalculationResponse> {
    const request: CalculationRequest = { expression };
    
    return this.http.post<CalculationResponse>(this.config.apiEndpoint, request)
      .pipe(
        retry({
          count: this.config.retryAttempts,
          delay: (error: HttpErrorResponse, retryCount: number) => {
            // Exponential backoff with jitter
            const delay = this.config.retryDelay * Math.pow(2, retryCount - 1);
            const jitter = Math.random() * 0.1 * delay;
            return timer(delay + jitter);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error
      errorMessage = 'Network error occurred. Please check your connection.';
    } else if (error.status >= 400 && error.status < 500) {
      // Client error (4xx)
      errorMessage = error.error?.error || 'Invalid request. Please check your input.';
    } else if (error.status >= 500) {
      // Server error (5xx)
      errorMessage = 'Server error occurred. Please try again later.';
    } else {
      // Unknown error
      errorMessage = 'An unexpected error occurred. Please try again.';
    }

    console.error('Calculator service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

// Provider configuration for dependency injection
export const CALCULATOR_SERVICE_PROVIDER = {
  provide: CalculatorService,
  useClass: CalculatorHttpService
};
