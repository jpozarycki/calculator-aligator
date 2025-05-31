import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalculationRequest, CalculationResponse } from './calculator.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CalculatorHttpService {

  constructor(private http: HttpClient) { }

  calculateExpression(expression: string): Observable<CalculationResponse> {
    const request: CalculationRequest = { expression };
    return this.http.post<CalculationResponse>('/api/calculate', request);
  }
}
