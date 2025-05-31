import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalculatorHttpService } from './calculator-http.service';
import { CalculationRequest, CalculationResponse } from './calculator.interfaces';

describe('CalculatorHttpService', () => {
  let service: CalculatorHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalculatorHttpService]
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
});
