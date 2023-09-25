import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = '';
  isKeywordSearch: boolean = false;
  noProductsFound: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.isKeywordSearch = this.route.snapshot.paramMap.has('keyword');

    this.isKeywordSearch
      ? this.handleProductSearch()
      : this.handleProductList();
  }

  handleProductList() {
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;

      if (this.previousCategoryId !== this.currentCategoryId) {
        this.currentPage = 1;
      }

      this.previousCategoryId = this.currentCategoryId;

      this.productService
        .getProductsByCategoryIdPaginated(
          this.currentCategoryId,
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(this.processResult());
    } else {
      this.listAllProducts();
    }
  }

  handleProductSearch() {
    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;

    this.productService
      .searchProductsByKeywordPaginated(
        keyword,
        this.currentPage - 1,
        this.pageSize
      )
      .subscribe(this.processResult());
  }

  listAllProducts() {
    this.productService
      .getAllProductsPaginated(this.currentPage - 1, this.pageSize)
      .subscribe(this.processResult());
  }

  private processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.noProductsFound = this.products.length === 0;
      this.currentPage = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalElements = data.page.totalElements;
    };
  }

  updatePageSize(pageSize: string) {
    this.pageSize = +pageSize;
    this.currentPage = 1;
    this.listProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(new CartItem(product));
  }
}
