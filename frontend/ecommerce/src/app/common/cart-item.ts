import { Product } from './product';

export class CartItem {
  public id: number = 0;
  public name: string = '';
  public imageUrl: string = '';
  public unitPrice: number = 0;
  public quantity: number = 1;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.imageUrl = product.imageUrl;
    this.unitPrice = product.unitPrice;
  }
}
