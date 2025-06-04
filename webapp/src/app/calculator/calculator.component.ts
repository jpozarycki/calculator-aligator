import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors as NgValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalculatorService, CALCULATOR_SERVICE_PROVIDER } from './calculator-http.service';
import { CalculationResponse, CalculatorState, ValidationErrors } from './calculator.interfaces';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [CALCULATOR_SERVICE_PROVIDER],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.less'
})
export class CalculatorComponent {
  private readonly calculatorService = inject(CalculatorService);
  private readonly destroyRef = inject(DestroyRef);

  state: CalculatorState = {
    result: null,
    errorMessage: '',
    isLoading: false
  };

  calculatorForm: FormGroup;

  constructor() {
    this.calculatorForm = new FormGroup({
      expression: new FormControl('', [
        Validators.required,
        this.mathExpressionValidator.bind(this)
      ])
    });

    this.calculatorForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearErrorsOnInput();
      });
  }

  // Custom validator for mathematical expressions (integers only)
  private mathExpressionValidator(control: AbstractControl): NgValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const expression = control.value.trim();
    
    // Check for basic mathematical expression pattern (integers only - no decimal point or parentheses)
    const mathPattern = /^-?[0-9]+(\s*[+\-*/]\s*-?[0-9]+)*$/;
    if (!mathPattern.test(expression)) {
      return { invalidMathExpression: { message: 'Expression can only contain integers and operators (+, -, *, /)' } };
    }

    // Check for parentheses (not allowed)
    if (/[()]/g.test(expression)) {
      return { parenthesesNotAllowed: { message: 'Parentheses are not supported. Please use simple arithmetic expressions' } };
    }

    // Check for decimal numbers (not allowed)
    if (/\d+\.\d+/.test(expression)) {
      return { decimalNotAllowed: { message: 'Decimal numbers are not supported. Please use only integers' } };
    }

    // Check for standalone dots
    if (/\./.test(expression)) {
      return { invalidDecimalPoint: { message: 'Decimal points are not allowed. Please use only integers' } };
    }

    // Check for consecutive operators (but allow negative numbers)
    if (/[+*/]{2,}/.test(expression.replace(/\s/g, '')) || /--/.test(expression.replace(/\s/g, ''))) {
      return { consecutiveOperators: { message: 'Consecutive operators are not allowed' } };
    }

    // Check for operators at the beginning (except minus) or end
    if (/^[+*/]/.test(expression.trim()) || /[+\-*/]$/.test(expression.trim())) {
      return { invalidOperatorPosition: { message: 'Expression cannot start or end with an operator' } };
    }

    return null;
  }

  calculate(): void {
    if (this.calculatorForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.updateState({
      isLoading: true,
      errorMessage: '',
      result: null
    });

    const expression = this.getExpressionValue();
    
    this.calculatorService.calculateExpression(expression)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CalculationResponse) => {
          this.handleCalculationResponse(response);
        },
        error: (error: Error) => {
          this.handleCalculationError(error);
        },
        complete: () => {
          this.updateState({ isLoading: false });
        }
      });
  }

  clearInput(): void {
    this.calculatorForm.reset();
    this.resetState();
  }

  // Getters for template access
  get isFormValid(): boolean {
    return this.calculatorForm.valid;
  }

  get hasResult(): boolean {
    return this.state.result !== null;
  }

  get hasError(): boolean {
    return !!this.state.errorMessage;
  }

  get expressionControl(): FormControl {
    return this.calculatorForm.get('expression') as FormControl;
  }

  get validationErrors(): ValidationErrors {
    const control = this.expressionControl;
    if (control && control.errors && control.touched) {
      return control.errors;
    }
    return {};
  }

  getValidationErrorMessage(errorKey: string): string {
    const errors = this.validationErrors;
    
    // Check if the error exists and has a message property
    if (errors[errorKey]) {
      if (errors[errorKey].message) {
        return errors[errorKey].message;
      }
      
      // Handle Angular's built-in validators
      if (errorKey === 'required') {
        return 'Expression is required';
      }
    }
    
    // Fallback messages for known error keys
    switch (errorKey) {
      case 'required':
        return 'Expression is required';
      case 'invalidMathExpression':
        return 'Expression can only contain integers and operators (+, -, *, /)';
      case 'parenthesesNotAllowed':
        return 'Parentheses are not supported. Please use simple arithmetic expressions';
      case 'decimalNotAllowed':
        return 'Decimal numbers are not supported. Please use only integers';
      case 'invalidDecimalPoint':
        return 'Decimal points are not allowed. Please use only integers';
      case 'consecutiveOperators':
        return 'Consecutive operators are not allowed';
      case 'invalidOperatorPosition':
        return 'Expression cannot start or end with an operator';
      default:
        return 'Invalid input';
    }
  }

  // Expose Object for template use
  Object = Object;

  // Private helper methods
  private updateState(partialState: Partial<CalculatorState>): void {
    this.state = { ...this.state, ...partialState };
  }

  private resetState(): void {
    this.state = {
      result: null,
      errorMessage: '',
      isLoading: false
    };
  }

  private getExpressionValue(): string {
    return this.calculatorForm.get('expression')?.value || '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.calculatorForm.controls).forEach(key => {
      this.calculatorForm.get(key)?.markAsTouched();
    });
  }

  private clearErrorsOnInput(): void {
    if (this.state.errorMessage) {
      this.updateState({ errorMessage: '' });
    }
  }

  private handleCalculationResponse(response: CalculationResponse): void {
    if (response.error) {
      this.updateState({
        errorMessage: response.error,
        result: null
      });
    } else {
      this.updateState({
        result: response.result,
        errorMessage: ''
      });
    }
  }

  private handleCalculationError(error: Error): void {
    this.updateState({
      errorMessage: error.message || 'An unexpected error occurred',
      result: null,
      isLoading: false
    });
  }
}
