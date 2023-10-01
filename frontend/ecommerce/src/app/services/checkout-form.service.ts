import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckoutFormService {
  private readonly EXPIRATION_YEAR_RANGE: number = 10;

  getCreditCardMonths(): Observable<number[]> {
    const months: number[] = [];
    const currentMonth: number = new Date().getMonth() + 1;

    for (let month = currentMonth; month <= 12; ++month) {
      months.push(month);
    }

    return of(months);
  }

  getCreditCardYears(): Observable<number[]> {
    const years: number[] = [];

    const currentYear: number = new Date().getFullYear();
    const endYear: number = currentYear + this.EXPIRATION_YEAR_RANGE;

    for (let year = currentYear; year <= endYear; ++year) {
      years.push(year);
    }

    return of(years);
  }
}
