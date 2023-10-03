import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css'],
})
export class CartStatusComponent implements OnInit {
  totalPrice$!: Observable<number>;
  totalQuantity$!: Observable<number>;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.updateCartStatus();
  }

  updateCartStatus(): void {
    this.totalPrice$ = this.cartService.totalPrice;
    this.totalQuantity$ = this.cartService.totalQuantity;
  }
}
