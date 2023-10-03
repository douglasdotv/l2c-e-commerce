import { Component, OnInit } from '@angular/core';
import { ProductCategory } from 'src/app/common/product-category';
import { ProductService } from 'src/app/services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css'],
})
export class ProductCategoryMenuComponent implements OnInit {
  productCategories$!: Observable<ProductCategory[]>;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.listProductCategories();
  }

  listProductCategories(): void {
    this.productCategories$ = this.productService.getAllProductCategories();
  }
}
