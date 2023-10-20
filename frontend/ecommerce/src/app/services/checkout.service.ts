import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly apiUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    const orderUrl: string = `${this.apiUrl}/checkout/purchase`;
    return this.httpClient.post(orderUrl, purchase);
  }
}
