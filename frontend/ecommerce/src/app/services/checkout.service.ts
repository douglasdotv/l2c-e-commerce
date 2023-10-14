import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api-config';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly baseApiUrl: string = API_CONFIG.baseUrl;

  constructor(private httpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    const orderUrl: string = `${this.baseApiUrl}/checkout/purchase`;
    return this.httpClient.post(orderUrl, purchase);
  }
}
