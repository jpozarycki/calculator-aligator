import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CalculatorComponent } from './calculator.component';
import { CalculatorHttpService } from './calculator-http.service';
import { CalculationResponse } from './calculator.interfaces';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let mockCalculatorService: jasmine.SpyObj<CalculatorHttpService>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    // Create a spy object for the service
    mockCalculatorService = jasmine.createSpyObj('CalculatorHttpService', ['calculateExpression']);

    await TestBed.configureTestingModule({
      imports: [CalculatorComponent, ReactiveFormsModule],
      providers: [
        { provide: CalculatorHttpService, useValue: mockCalculatorService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty expression', () => {
    expect(component.calculatorForm).toBeDefined();
    expect(component.calculatorForm.get('expression')?.value).toBe('');
    expect(component.result).toBeNull();
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBeFalse();
  });

  it('should call service when calculate() is called', () => {
    const expression = '2 + 3';
    const mockResponse: CalculationResponse = { result: 5, error: null };
    
    mockCalculatorService.calculateExpression.and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    component.calculate();

    expect(mockCalculatorService.calculateExpression).toHaveBeenCalledWith(expression);
  });

  it('should display result on successful calculation', () => {
    const expression = '3 * 2 + 1';
    const mockResponse: CalculationResponse = { result: 7, error: null };
    
    mockCalculatorService.calculateExpression.and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    component.calculate();

    expect(component.result).toBe(7);
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBeFalse();
  });

  it('should display error message on failed calculation', () => {
    const expression = '2 / 0';
    const mockResponse: CalculationResponse = { result: null, error: 'Division by zero' };
    
    mockCalculatorService.calculateExpression.and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    component.calculate();

    expect(component.result).toBeNull();
    expect(component.errorMessage).toBe('Division by zero');
    expect(component.isLoading).toBeFalse();
  });

  it('should clear input and result when clearInput() is called', () => {
    // Set some initial values
    component.calculatorForm.get('expression')?.setValue('1 + 1');
    component.result = 2;
    component.errorMessage = 'Some error';
    
    component.clearInput();

    expect(component.calculatorForm.get('expression')?.value).toBeNull();
    expect(component.result).toBeNull();
    expect(component.errorMessage).toBe('');
  });

  it('should disable submit button when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should enable submit button when not loading and expression is not empty', () => {
    component.isLoading = false;
    component.calculatorForm.get('expression')?.setValue('1 + 1');
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('should disable submit button when expression is empty', () => {
    component.isLoading = false;
    component.calculatorForm.get('expression')?.setValue('');
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should handle HTTP errors gracefully', () => {
    const expression = '1 + 1';
    const errorMessage = 'Server error occurred';
    
    mockCalculatorService.calculateExpression.and.returnValue(
      throwError(() => ({ error: { error: errorMessage } }))
    );
    
    component.calculatorForm.get('expression')?.setValue(expression);
    component.calculate();

    expect(component.result).toBeNull();
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.isLoading).toBeFalse();
  });

  it('should set loading state during calculation', () => {
    const expression = '1 + 1';
    const mockResponse: CalculationResponse = { result: 2, error: null };
    
    mockCalculatorService.calculateExpression.and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    
    // Before calling calculate
    expect(component.isLoading).toBeFalse();
    
    // Start calculation
    component.calculate();
    
    // After calculation completes
    expect(component.isLoading).toBeFalse();
  });

  it('should clear previous errors when starting new calculation', () => {
    // Set initial error
    component.errorMessage = 'Previous error';
    component.result = null;
    
    const expression = '5 + 5';
    const mockResponse: CalculationResponse = { result: 10, error: null };
    
    mockCalculatorService.calculateExpression.and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    component.calculate();

    expect(component.errorMessage).toBe('');
    expect(component.result as number | null).toBe(10);
  });
});
