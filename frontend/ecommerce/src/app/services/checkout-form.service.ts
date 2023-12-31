import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Injectable } from '@angular/core';
import { Country } from '../common/country';
import { State } from '../common/state';
import { EmbeddedData } from '../common/embedded-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutFormService {
  private readonly apiUrl: string = environment.apiUrl;
  private readonly EXPIRATION_YEAR_RANGE: number = 10;

  constructor(private httpClient: HttpClient) {}

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    const months: number[] = [];

    for (let month = startMonth; month <= 12; ++month) {
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

  getCountries(): Observable<Country[]> {
    const url = `${this.apiUrl}/countries`;
    return this.httpClient.get<EmbeddedData<Country>>(url).pipe(
      map((response) => {
        return response._embedded['countries'];
      })
    );
  }

  getStatesByCountryCode(countryCode: string): Observable<State[]> {
    const url = `${this.apiUrl}/states/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<EmbeddedData<State>>(url).pipe(
      map((response) => {
        return response._embedded['states'];
      })
    );
  }
}
