import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculatorHttpService } from './calculator-http.service';
import { CalculationResponse } from './calculator.interfaces';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.less'
})
export class CalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: number | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private calculatorService: CalculatorHttpService) {
    this.calculatorForm = new FormGroup({
      expression: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  calculate(): void {
    if (this.calculatorForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;

    const expression = this.calculatorForm.get('expression')?.value;
    
    this.calculatorService.calculateExpression(expression).subscribe({
      next: (response: CalculationResponse) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.error || 'Network error occurred. Please try again.';
        this.handleError({ result: null, error: errorMessage });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  clearInput(): void {
    this.calculatorForm.reset();
    this.result = null;
    this.errorMessage = '';
    this.isLoading = false;
  }

  private handleSuccess(response: CalculationResponse): void {
    if (response.error) {
      this.errorMessage = response.error;
      this.result = null;
    } else {
      this.result = response.result;
      this.errorMessage = '';
    }
  }

  private handleError(response: CalculationResponse): void {
    this.errorMessage = response.error || 'An error occurred';
    this.result = null;
  }
}
