import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CalculatorComponent } from './calculator.component';
import { CalculatorService } from './calculator-http.service';
import { CalculationResponse } from './calculator.interfaces';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let mockCalculatorService: jasmine.SpyObj<CalculatorService>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    // Create a spy object for the service
    mockCalculatorService = jasmine.createSpyObj('CalculatorService', ['calculateExpression']);

    await TestBed.configureTestingModule({
      imports: [
        CalculatorComponent, 
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CalculatorService, useValue: mockCalculatorService }
      ],
      teardown: {destroyAfterEach: false}
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

  it('should initialize with empty expression and default state', () => {
    expect(component.calculatorForm).toBeDefined();
    expect(component.calculatorForm.get('expression')?.value).toBe('');
    expect(component.state.result).toBeNull();
    expect(component.state.errorMessage).toBe('');
    expect(component.state.isLoading).toBeFalse();
  });

  it('should display result on successful calculation', fakeAsync(() => {
    const expression = '3 * 2 + 1';
    const mockResponse: CalculationResponse = { result: 7, error: null };
    
    // Spy on the actual service in the component instead of the mock
    const actualService = (component as any).calculatorService;
    spyOn(actualService, 'calculateExpression').and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    fixture.detectChanges();
    tick();
    
    component.calculate();

    tick();
    fixture.detectChanges();
    

    expect(component.state.result).toBe(7);
    expect(component.state.errorMessage).toBe('');
    expect(component.state.isLoading).toBeFalse();
  }));

  it('should display error message on failed calculation', fakeAsync(() => {
    const expression = '2 / 0';
    const mockResponse: CalculationResponse = { result: null, error: 'Division by zero' };
    
    // Spy on the actual service in the component instead of the mock
    const actualService = (component as any).calculatorService;
    spyOn(actualService, 'calculateExpression').and.returnValue(of(mockResponse));
    
    component.calculatorForm.get('expression')?.setValue(expression);
    tick();
    fixture.detectChanges();

    component.calculate();
    tick();
    fixture.detectChanges();

    expect(component.state.result).toBeNull();
    expect(component.state.errorMessage).toBe('Division by zero');
    expect(component.state.isLoading).toBeFalse();
  }));

  it('should clear input and result when clearInput() is called', () => {
    // Set some initial values
    component.calculatorForm.get('expression')?.setValue('1 + 1');
    component.state.result = 2;
    component.state.errorMessage = 'Some error';
    
    component.clearInput();

    expect(component.calculatorForm.get('expression')?.value).toBeNull();
    expect(component.state.result).toBeNull();
    expect(component.state.errorMessage).toBe('');
  });

  it('should disable submit button when loading', () => {
    component.state.isLoading = true;
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should enable submit button when not loading and expression is valid', () => {
    component.state.isLoading = false;
    component.calculatorForm.get('expression')?.setValue('1 + 1');
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('should disable submit button when expression is empty', () => {
    component.state.isLoading = false;
    component.calculatorForm.get('expression')?.setValue('');
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should handle HTTP errors gracefully', fakeAsync(() => {
    const expression = '1 + 1';
    const errorMessage = 'Server error occurred';

    const actualService = (component as any).calculatorService;
    spyOn(actualService, 'calculateExpression').and.returnValue(
      throwError(() => new Error(errorMessage))
    );
    
    component.calculatorForm.get('expression')?.setValue(expression);
    tick();
    fixture.detectChanges();

    component.calculate();
    tick();
    fixture.detectChanges();

    expect(component.state.result).toBeNull();
    expect(component.state.errorMessage).toBe(errorMessage);
    expect(component.state.isLoading).toBeFalse();
  }));

  it('should clear previous errors when starting new calculation', fakeAsync(() => {
    // Set initial error
    component.state.errorMessage = 'Previous error';
    component.state.result = null;
    
    const expression = '5 + 5';
    const mockResponse: CalculationResponse = { result: 10, error: null };
    

    const actualService = (component as any).calculatorService;
    spyOn(actualService, 'calculateExpression').and.returnValue(of(mockResponse));

    component.calculatorForm.get('expression')?.setValue(expression);
    tick();
    fixture.detectChanges();

    component.calculate();
    tick();
    fixture.detectChanges();

    expect(component.state.errorMessage).toBe('');
    expect(component.state.result as any).toBe(10);
  }));

  // Tests for new validation functionality
  it('should validate mathematical expressions', () => {
    const expressionControl = component.calculatorForm.get('expression');
    
    // Valid expressions
    expressionControl?.setValue('2 + 3');
    expect(expressionControl?.valid).toBeTrue();
    
    expressionControl?.setValue('10 + 5 * 2');
    expect(expressionControl?.valid).toBeTrue();
    
    // Invalid expressions
    expressionControl?.setValue('2 + + 3');
    expect(expressionControl?.invalid).toBeTrue();
    
    expressionControl?.setValue('2 +');
    expect(expressionControl?.invalid).toBeTrue();
    
    expressionControl?.setValue('(2 + 3');
    expect(expressionControl?.invalid).toBeTrue();
  });

  it('should reject decimal numbers', () => {
    const expressionControl = component.calculatorForm.get('expression');
    
    expressionControl?.setValue('2.5 + 3');
    expect(expressionControl?.invalid).toBeTrue();
    expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    
    expressionControl?.setValue('10 + 3.14');
    expect(expressionControl?.invalid).toBeTrue();
    expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    
    expressionControl?.setValue('1.0 * 2.0');
    expect(expressionControl?.invalid).toBeTrue();
    expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    
    // Test standalone decimal points are rejected
    expressionControl?.setValue('2 + . + 3');
    expect(expressionControl?.invalid).toBeTrue();
    expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
  });

  it('should provide validation error messages', () => {
    const expressionControl = component.calculatorForm.get('expression');
    
    expressionControl?.setValue('abc');
    expressionControl?.markAsTouched();
    fixture.detectChanges();
    
    expect(component.getValidationErrorMessage('invalidMathExpression')).toContain('integers and operators');
  });

  it('should have proper getter methods working', () => {
    // Test hasResult getter
    component.state.result = 42;
    expect(component.hasResult).toBeTrue();
    
    component.state.result = null;
    expect(component.hasResult).toBeFalse();
    
    // Test hasError getter
    component.state.errorMessage = 'Some error';
    expect(component.hasError).toBeTrue();
    
    component.state.errorMessage = '';
    expect(component.hasError).toBeFalse();
    
    // Test isFormValid getter
    component.calculatorForm.get('expression')?.setValue('2 + 3');
    expect(component.isFormValid).toBeTrue();
    
    component.calculatorForm.get('expression')?.setValue('');
    expect(component.isFormValid).toBeFalse();
  });

  it('should reject parentheses', () => {
    const expressionControl = component.calculatorForm.get('expression');
    
    expressionControl?.setValue('2 * (5 + 1)');
    expect(expressionControl?.invalid).toBeTrue();
    expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes on main container', () => {
      const mainContainer = debugElement.query(By.css('[role="main"]'));
      expect(mainContainer).toBeTruthy();
      expect(mainContainer.nativeElement.getAttribute('role')).toBe('main');
    });

    it('should have proper heading structure', () => {
      const h1 = debugElement.query(By.css('h1'));
      const h2Elements = debugElement.queryAll(By.css('h2'));
      
      expect(h1).toBeTruthy();
      expect(h1.nativeElement.textContent.trim()).toBe('Calculator');
      expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper form labeling and ARIA attributes', () => {
      const input = debugElement.query(By.css('#expression'));
      const label = debugElement.query(By.css('label[for="expression"]'));
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.nativeElement.getAttribute('id')).toBe('expression');
      expect(label.nativeElement.getAttribute('for')).toBe('expression');
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('off');
      expect(input.nativeElement.getAttribute('spellcheck')).toBe('false');
    });

    it('should set aria-invalid when form has validation errors', () => {
      const input = debugElement.query(By.css('#expression'));
      const expressionControl = component.calculatorForm.get('expression');
      
      // Set invalid value and mark as touched
      expressionControl?.setValue('invalid((');
      expressionControl?.markAsTouched();
      fixture.detectChanges();
      
      expect(input.nativeElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should have proper aria-describedby relationship', () => {
      const input = debugElement.query(By.css('#expression'));
      const expressionControl = component.calculatorForm.get('expression');
      
      // Valid state - should reference help text
      expressionControl?.setValue('2 + 3');
      fixture.detectChanges();
      
      expect(input.nativeElement.getAttribute('aria-describedby')).toBe('expression-help');
      
      // Invalid state - should reference error
      expressionControl?.setValue('invalid((');
      expressionControl?.markAsTouched();
      fixture.detectChanges();
      
      expect(input.nativeElement.getAttribute('aria-describedby')).toBe('expression-error');
    });

    it('should have role="alert" for validation errors', () => {
      const expressionControl = component.calculatorForm.get('expression');
      expressionControl?.setValue('invalid((');
      expressionControl?.markAsTouched();
      fixture.detectChanges();
      
      const errorContainer = debugElement.query(By.css('#expression-error'));
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.nativeElement.getAttribute('role')).toBe('alert');
      expect(errorContainer.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have proper button labels and states', () => {
      const calculateButton = debugElement.query(By.css('button[type="submit"]'));
      const clearButton = debugElement.query(By.css('[data-testid="clear-button"]'));
      
      expect(calculateButton).toBeTruthy();
      expect(clearButton).toBeTruthy();
      expect(clearButton.nativeElement.getAttribute('aria-label')).toBe('Clear input and reset calculator');
    });

    it('should show loading state with proper accessibility attributes', () => {
      component.state.isLoading = true;
      fixture.detectChanges();
      
      const loadingStatus = debugElement.query(By.css('#loading-status'));
      const calculateButton = debugElement.query(By.css('button[type="submit"]'));
      
      expect(loadingStatus).toBeTruthy();
      expect(loadingStatus.nativeElement.getAttribute('aria-live')).toBe('polite');
      expect(loadingStatus.nativeElement.getAttribute('aria-atomic')).toBe('true');
      expect(calculateButton.nativeElement.getAttribute('aria-describedby')).toBe('loading-status');
    });

    it('should have proper result display with accessibility attributes', () => {
      component.state.result = 42;
      fixture.detectChanges();
      
      const resultElement = debugElement.query(By.css('[data-testid="result"]'));
      const resultSection = resultElement.nativeElement.closest('[role="region"]');
      
      expect(resultElement).toBeTruthy();
      expect(resultElement.nativeElement.getAttribute('role')).toBe('status');
      expect(resultElement.nativeElement.getAttribute('aria-live')).toBe('polite');
      expect(resultElement.nativeElement.getAttribute('tabindex')).toBe('0');
      expect(resultSection).toBeTruthy();
    });

    it('should have error messages with proper accessibility attributes', () => {
      component.state.errorMessage = 'Test error message';
      fixture.detectChanges();
      
      const errorElement = debugElement.query(By.css('[data-testid="error-message"]'));
      
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.getAttribute('tabindex')).toBe('0');
      
      const errorSection = errorElement?.nativeElement.closest('[role="alert"]');
      expect(errorSection).toBeTruthy();
      expect(errorSection?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have screen reader only content properly hidden', () => {
      const srOnlyElements = debugElement.queryAll(By.css('.sr-only'));
      
      expect(srOnlyElements.length).toBeGreaterThan(0);
      
      // Check that sr-only elements have proper styling (this would typically be done in e2e tests)
      srOnlyElements.forEach(element => {
        const computedStyle = getComputedStyle(element.nativeElement);
        // Note: In unit tests, computed styles might not work exactly like in browser
        // This is more of a structural test
        expect(element.nativeElement.classList.contains('sr-only')).toBeTrue();
      });
    });
  });


  describe('Advanced Validation Edge Cases', () => {
    it('should handle whitespace-only expressions', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      expressionControl?.setValue('   ');
      expect(expressionControl?.invalid).toBeTrue();
      expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    });

    it('should handle mixed valid and invalid characters', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      expressionControl?.setValue('2 + 3a');
      expect(expressionControl?.invalid).toBeTrue();
      expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    });

    it('should handle negative numbers correctly', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      // These should be valid
      expressionControl?.setValue('-5 + 3');
      expect(expressionControl?.valid).toBeTrue();
      
      expressionControl?.setValue('10 + -3');
      expect(expressionControl?.valid).toBeTrue();
      
      expressionControl?.setValue('-10 * -2');
      expect(expressionControl?.valid).toBeTrue();
    });

    it('should handle expressions starting or ending with spaces', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      expressionControl?.setValue('  2 + 3  ');
      expect(expressionControl?.valid).toBeTrue();
    });

    it('should reject expressions with only operators', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      expressionControl?.setValue('++--');
      expect(expressionControl?.invalid).toBeTrue();
      expect(expressionControl?.errors?.['invalidMathExpression']).toBeTruthy();
    });


    it('should provide specific error messages for each validation type', () => {
      const expressionControl = component.calculatorForm.get('expression');
      
      // Test decimal error message
      expressionControl?.setValue('2.5 + 3');
      expect(component.getValidationErrorMessage('decimalNotAllowed')).toContain('Decimal numbers are not supported');
      
      // Test parentheses error message
      expressionControl?.setValue('(2 + 3)');
      expect(component.getValidationErrorMessage('parenthesesNotAllowed')).toContain('Parentheses are not supported');
      
      // Test consecutive operators error message
      expressionControl?.setValue('2 ++ 3');
      expect(component.getValidationErrorMessage('consecutiveOperators')).toContain('Consecutive operators are not allowed');
      
      // Test invalid operator position error message
      expressionControl?.setValue('+2 + 3');
      expect(component.getValidationErrorMessage('invalidOperatorPosition')).toContain('cannot start or end with an operator');
    });
  });
});
