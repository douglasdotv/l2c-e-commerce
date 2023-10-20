import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderDetails } from '../common/order-details';
import { EmbeddedDataWithPagination } from '../common/embedded-data-with-pagination';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private readonly apiUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(email: string): Observable<EmbeddedDataWithPagination<OrderDetails>> {
    const url: string = `${this.apiUrl}/orders/search/findByCustomerEmailOrderByDateCreatedDesc?email=${email}`;
    return this.httpClient.get<EmbeddedDataWithPagination<OrderDetails>>(url);
  }
}
