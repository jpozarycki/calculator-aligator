import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalculatorComponent } from './calculator.component';
import { CALCULATOR_SERVICE_PROVIDER } from './calculator-http.service';
import { CalculationResponse } from './calculator.interfaces';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('CalculatorComponent Integration Tests', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let httpMock: HttpTestingController;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalculatorComponent,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [CALCULATOR_SERVICE_PROVIDER]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should calculate "2 + 3" and display 5', () => {
    // Enter expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '2 + 3';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click calculate button
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    // Mock backend response
    const mockResponse: CalculationResponse = { result: 5, error: null };
    const req = httpMock.expectOne('/api/calculate');
    expect(req.request.body).toEqual({ expression: '2 + 3' });
    req.flush(mockResponse);
    fixture.detectChanges();

    // Verify result is displayed
    const resultElement = debugElement.query(By.css('[data-testid="result"]'));
    expect(resultElement.nativeElement.textContent).toContain('5');
  });

  it('should calculate "3 * 2 + 1" and display 7', () => {
    // Enter expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '3 * 2 + 1';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click calculate button
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    // Mock backend response
    const mockResponse: CalculationResponse = { result: 7, error: null };
    const req = httpMock.expectOne('/api/calculate');
    expect(req.request.body).toEqual({ expression: '3 * 2 + 1' });
    req.flush(mockResponse);
    fixture.detectChanges();

    // Verify result is displayed
    const resultElement = debugElement.query(By.css('[data-testid="result"]'));
    expect(resultElement.nativeElement.textContent).toContain('7');
  });

  it('should calculate "3 * -2 + 6" and display 0', () => {
    // Enter expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '3 * -2 + 6';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click calculate button
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    // Mock backend response
    const mockResponse: CalculationResponse = { result: 0, error: null };
    const req = httpMock.expectOne('/api/calculate');
    expect(req.request.body).toEqual({ expression: '3 * -2 + 6' });
    req.flush(mockResponse);
    fixture.detectChanges();

    // Verify result is displayed
    const resultElement = debugElement.query(By.css('[data-testid="result"]'));
    expect(resultElement.nativeElement.textContent).toContain('0');
  });

  it('should show error for "2 / 0"', () => {
    // Enter expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '2 / 0';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click calculate button
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    // Mock backend error response
    const mockResponse: CalculationResponse = { result: null, error: 'Division by zero' };
    const req = httpMock.expectOne('/api/calculate');
    req.flush(mockResponse);
    fixture.detectChanges();

    // Verify error is displayed
    const errorElement = debugElement.query(By.css('[data-testid="error-message"]'));
    expect(errorElement.nativeElement.textContent).toContain('Division by zero');
  });

  it('should show error for empty expression', () => {
    // Leave input empty
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify submit button is disabled
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    expect(calculateButton.nativeElement.disabled).toBeTrue();
  });

  it('should show error for invalid expression "2 + + 3"', () => {
    // Enter invalid expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '2 + + 3';
    input.nativeElement.dispatchEvent(new Event('input'));
    input.nativeElement.dispatchEvent(new Event('blur')); // Trigger touched state for validation
    fixture.detectChanges();

    // The form should be invalid, so the submit button should be disabled
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    expect(calculateButton.nativeElement.disabled).toBeTrue();
    
    // Should show client-side validation error, not make HTTP request
    const errorContainer = debugElement.query(By.css('#expression-error'));
    expect(errorContainer).toBeTruthy();
    
    // No HTTP request should be made due to client-side validation
    httpMock.expectNone('/api/calculate');
  });

  it('should clear form and results when clear button is clicked', () => {
    // First perform a calculation
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '5 + 5';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    const mockResponse: CalculationResponse = { result: 10, error: null };
    const req = httpMock.expectOne('/api/calculate');
    req.flush(mockResponse);
    fixture.detectChanges();

    // Now click clear button
    const clearButton = debugElement.query(By.css('[data-testid="clear-button"]'));
    clearButton.nativeElement.click();
    fixture.detectChanges();

    // Verify form is cleared
    expect(input.nativeElement.value).toBe('');
    
    // Verify result is cleared
    const resultElement = debugElement.query(By.css('[data-testid="result"]'));
    expect(resultElement).toBeNull();
  });

  it('should show loading state while calculating', () => {
    // Enter expression
    const input = debugElement.query(By.css('input[formControlName="expression"]'));
    input.nativeElement.value = '10 + 10';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click calculate button
    const calculateButton = debugElement.query(By.css('button[type="submit"]'));
    calculateButton.nativeElement.click();
    fixture.detectChanges();

    // Before response, button should show loading state
    expect(calculateButton.nativeElement.textContent).toContain('Calculating...');
    expect(calculateButton.nativeElement.disabled).toBeTrue();

    // Send response
    const mockResponse: CalculationResponse = { result: 20, error: null };
    const req = httpMock.expectOne('/api/calculate');
    req.flush(mockResponse);
    fixture.detectChanges();

    // After response, button should be back to normal
    expect(calculateButton.nativeElement.textContent).toContain('Calculate');
    expect(calculateButton.nativeElement.disabled).toBeFalse();
  });
}); 