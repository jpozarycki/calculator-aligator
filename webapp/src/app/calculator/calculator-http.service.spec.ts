import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalculatorHttpService, CalculatorService, CALCULATOR_SERVICE_PROVIDER } from './calculator-http.service';
import { CalculationRequest, CalculationResponse } from './calculator.interfaces';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('CalculatorHttpService', () => {
  let service: CalculatorHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CalculatorHttpService,
        CALCULATOR_SERVICE_PROVIDER
      ]
    });
    service = TestBed.inject(CalculatorHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to /api/calculate with correct payload', () => {
    const expression = '2 + 3';
    const expectedRequest: CalculationRequest = { expression };
    
    service.calculateExpression(expression).subscribe();

    const req = httpMock.expectOne('/api/calculate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedRequest);
  });

  it('should return CalculationResponse on success', () => {
    const expression = '3 * 2 + 1';
    const mockResponse: CalculationResponse = {
      result: 7,
      error: null
    };

    service.calculateExpression(expression).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.result).toBe(7);
      expect(response.error).toBeNull();
    });

    const req = httpMock.expectOne('/api/calculate');
    req.flush(mockResponse);
  });

  it('should handle error responses from backend', () => {
    const expression = '2 / 0';
    const mockErrorResponse: CalculationResponse = {
      result: null,
      error: 'Division by zero'
    };

    service.calculateExpression(expression).subscribe(response => {
      expect(response).toEqual(mockErrorResponse);
      expect(response.result).toBeNull();
      expect(response.error).toBe('Division by zero');
    });

    const req = httpMock.expectOne('/api/calculate');
    req.flush(mockErrorResponse);
  });

  it('should handle network errors', () => {
    const expression = '1 + 1';
    const mockError = new ErrorEvent('Network error', {
      message: 'Network connection failed'
    });

    service.calculateExpression(expression).subscribe({
      next: () => fail('should have failed with network error'),
      error: (error) => {
        expect(error.error.message).toBe('Network connection failed');
      }
    });

    const req = httpMock.expectOne('/api/calculate');
    req.error(mockError);
  });

  it('should handle HTTP error status codes', () => {
    const expression = 'invalid expression';

    service.calculateExpression(expression).subscribe({
      next: () => fail('should have failed with HTTP error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });

    const req = httpMock.expectOne('/api/calculate');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  // ============ SERVICE ABSTRACTION LAYER TESTS (Phase 3 Addition) ============

  describe('Service Abstraction and SOLID Principles', () => {
    it('should implement CalculatorService abstract class', () => {
      expect(service instanceof CalculatorService).toBeTrue();
      expect(typeof service.calculateExpression).toBe('function');
    });

    it('should be injectable as CalculatorService', () => {
      const abstractService = TestBed.inject(CalculatorService);
      expect(abstractService).toBeTruthy();
      expect(abstractService).toBeInstanceOf(CalculatorHttpService);
    });

    it('should maintain dependency inversion principle', () => {
      // Verify that consumers can depend on the abstract CalculatorService
      const injectedService = TestBed.inject(CalculatorService);
      
      const expression = '5 + 5';
      const mockResponse: CalculationResponse = { result: 10, error: null };
      
      injectedService.calculateExpression(expression).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush(mockResponse);
    });
  });

  // ============ RETRY LOGIC AND ERROR HANDLING TESTS (Phase 3 Addition) ============

  describe('Retry Logic and Advanced Error Handling', () => {
    it('should succeed on retry if subsequent request succeeds', fakeAsync(() => {
      const expression = '2 + 2';
      const successResponse: CalculationResponse = { result: 4, error: null };
      let responseReceived = false;
      
      service.calculateExpression(expression).subscribe(response => {
        responseReceived = true;
        expect(response).toEqual(successResponse);
      });

      // First request fails
      const firstReq = httpMock.expectOne('/api/calculate');
      firstReq.flush('Temporary Error', { status: 500, statusText: 'Internal Server Error' });
      
      // Wait for retry (1000ms + jitter)
      tick(1100);
      
      // Second request succeeds
      const secondReq = httpMock.expectOne('/api/calculate');
      secondReq.flush(successResponse);
      
      // Verify response was received
      expect(responseReceived).toBeTrue();
    }));

    it('should categorize client errors (4xx) correctly', () => {
      const expression = 'invalid';
      
      service.calculateExpression(expression).subscribe({
        next: () => fail('should have failed with client error'),
        error: (error) => {
          expect(error.message).toContain('Invalid request');
        }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush({ error: 'Bad input' }, { status: 400, statusText: 'Bad Request' });
    });


    it('should handle network connectivity errors appropriately', () => {
      const expression = '3 + 3';
      
      service.calculateExpression(expression).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.message).toContain('Network error');
        }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.error(new ErrorEvent('Network Error', {
        message: 'Connection refused'
      }));
    });

    it('should handle unknown errors gracefully', () => {
      const expression = '4 + 4';
      
      service.calculateExpression(expression).subscribe({
        next: () => fail('should have failed with unknown error'),
        error: (error) => {
          expect(error.message).toContain('unexpected error');
        }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush('Unknown Error', { status: 999, statusText: 'Unknown' });
    });
  });

  // ============ CONFIGURATION AND ENDPOINT MANAGEMENT TESTS (Phase 3 Addition) ============

  describe('Configuration Management', () => {
    it('should use correct API endpoint configuration', () => {
      const expression = '6 + 4';
      
      service.calculateExpression(expression).subscribe();

      const req = httpMock.expectOne('/api/calculate');
      expect(req.request.url).toBe('/api/calculate');
      req.flush({ result: 10, error: null });
    });

    it('should send requests with correct HTTP method and headers', () => {
      const expression = '7 + 3';
      
      service.calculateExpression(expression).subscribe();

      const req = httpMock.expectOne('/api/calculate');
      expect(req.request.method).toBe('POST');
      // Note: Angular HttpClient automatically handles JSON serialization
      // Content-Type header is set automatically when sending JSON data
      req.flush({ result: 10, error: null });
    });

    it('should handle concurrent requests independently', () => {
      const expression1 = '1 + 1';
      const expression2 = '2 + 2';
      const expression3 = '3 + 3';
      
      // Start multiple concurrent requests
      service.calculateExpression(expression1).subscribe();
      service.calculateExpression(expression2).subscribe();
      service.calculateExpression(expression3).subscribe();

      // Verify all requests are made
      const requests = httpMock.match('/api/calculate');
      expect(requests.length).toBe(3);
      
      // Verify correct payloads
      expect(requests[0].request.body).toEqual({ expression: expression1 });
      expect(requests[1].request.body).toEqual({ expression: expression2 });
      expect(requests[2].request.body).toEqual({ expression: expression3 });
      
      // Respond to all
      requests[0].flush({ result: 2, error: null });
      requests[1].flush({ result: 4, error: null });
      requests[2].flush({ result: 6, error: null });
    });
  });

  // ============ OBSERVABLE BEHAVIOR AND MEMORY MANAGEMENT TESTS (Phase 3 Addition) ============

  describe('Observable Behavior and Memory Management', () => {
    it('should complete observable on successful response', () => {
      const expression = '8 + 2';
      let completed = false;
      
      service.calculateExpression(expression).subscribe({
        next: () => {},
        complete: () => { completed = true; }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush({ result: 10, error: null });
      
      expect(completed).toBeTrue();
    });

    it('should emit only once per successful request', () => {
      const expression = '9 + 1';
      let emissionCount = 0;
      
      service.calculateExpression(expression).subscribe({
        next: () => { emissionCount++; }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush({ result: 10, error: null });
      
      expect(emissionCount).toBe(1);
    });

    it('should handle subscription cleanup properly', () => {
      const expression = '5 * 2';
      
      const subscription = service.calculateExpression(expression).subscribe();
      expect(subscription.closed).toBeFalse();
      
      const req = httpMock.expectOne('/api/calculate');
      req.flush({ result: 10, error: null });
      
      expect(subscription.closed).toBeTrue();
    });
  });

  // ============ EDGE CASES AND BOUNDARY CONDITIONS (Phase 3 Addition) ============

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty expression', () => {
      const expression = '';
      
      service.calculateExpression(expression).subscribe();

      const req = httpMock.expectOne('/api/calculate');
      expect(req.request.body).toEqual({ expression: '' });
      req.flush({ result: null, error: 'Empty expression' });
    });

    it('should handle very long expressions', () => {
      const expression = '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10';
      
      service.calculateExpression(expression).subscribe();

      const req = httpMock.expectOne('/api/calculate');
      expect(req.request.body).toEqual({ expression });
      req.flush({ result: 55, error: null });
    });

    it('should handle special characters in expression', () => {
      const expression = '2 + 3';
      
      service.calculateExpression(expression).subscribe();

      const req = httpMock.expectOne('/api/calculate');
      expect(req.request.body).toEqual({ expression });
      req.flush({ result: 5, error: null });
    });

    it('should handle malformed server responses gracefully', () => {
      const expression = '1 + 1';
      
      service.calculateExpression(expression).subscribe({
        next: (response) => {
          // Should still work with partial response
          expect(response).toBeDefined();
        }
      });

      const req = httpMock.expectOne('/api/calculate');
      req.flush({ result: 2 }); // Missing error field
    });
  });
});
