import { OrderHistoryService } from './../../services/order-history.service';
import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OrderDetails } from 'src/app/common/order-details';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  orders$!: Observable<OrderDetails[]>;
  session: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService) {}

  ngOnInit(): void {
    this.getOrderHistory();
  }

  getOrderHistory(): void {
    const userEmail: string = JSON.parse(this.session.getItem('userEmail')!);
    this.orders$ = this.orderHistoryService.getOrderHistory(userEmail).pipe(
      map((response) => {
        const orders: OrderDetails[] = response._embedded['orders'];
        return orders;
      })
    );
  }
}
