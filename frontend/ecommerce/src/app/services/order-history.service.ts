import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderDetails } from '../common/order-details';
import { EmbeddedDataWithPagination } from '../common/embedded-data-with-pagination';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private readonly baseApiUrl: string = API_CONFIG.baseUrl;

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(email: string): Observable<EmbeddedDataWithPagination<OrderDetails>> {
    const url: string = `${this.baseApiUrl}/orders/search/findByCustomerEmailOrderByDateCreatedDesc?email=${email}`;
    return this.httpClient.get<EmbeddedDataWithPagination<OrderDetails>>(url);
  }
}
