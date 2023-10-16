import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  storage: Storage = sessionStorage;

  constructor() {
    const data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data !== null) {
      this.cartItems = data;
      this.updateAndPersistCartTotals();
    }
  }

  addToCart(cartItem: CartItem): void {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find((item) => item.id === cartItem.id);
      alreadyExistsInCart = existingCartItem !== undefined;
    }

    if (!alreadyExistsInCart) {
      this.cartItems.push(cartItem);
    } else {
      existingCartItem!.quantity++;
    }

    this.updateAndPersistCartTotals();
  }

  updateAndPersistCartTotals(): void {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let cartItem of this.cartItems) {
      totalPriceValue += cartItem.quantity * cartItem.unitPrice;
      totalQuantityValue += cartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.persistCartItems();
  }

  incrementQuantity(cartItem: CartItem): void {
    cartItem.quantity++;
    this.updateAndPersistCartTotals();
  }

  decrementQuantity(cartItem: CartItem): void {
    cartItem.quantity--;

    if (cartItem.quantity === 0) {
      this.removeFromCart(cartItem);
    } else {
      this.updateAndPersistCartTotals();
    }
  }

  removeFromCart(cartItem: CartItem): void {
    const itemIndex = this.cartItems.findIndex(
      (item) => item.id === cartItem.id
    );

    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
    }

    this.updateAndPersistCartTotals();
  }

  resetCart(): void {
    this.cartItems = [];
    this.totalPrice.next(0);
    this.totalQuantity.next(0);
    this.storage.removeItem('cartItems');
  }

  persistCartItems(): void {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
}
