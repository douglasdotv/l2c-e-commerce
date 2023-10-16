import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice$!: Observable<number>;
  totalQuantity$!: Observable<number>;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.showCartDetails();
  }

  showCartDetails(): void {
    this.cartItems = this.cartService.cartItems;
    this.totalPrice$ = this.cartService.totalPrice;
    this.totalQuantity$ = this.cartService.totalQuantity;
    this.cartService.updateAndPersistCartTotals();
  }

  incrementQuantity(cartItem: CartItem): void {
    this.cartService.incrementQuantity(cartItem);
  }

  decrementQuantity(cartItem: CartItem): void {
    this.cartService.decrementQuantity(cartItem);
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartService.removeFromCart(cartItem);
  }
}
