import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';

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
    } else {
      this.currentCategoryId = 1;
    }

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
      .subscribe((data) => {
        this.products = data._embedded['products'];
        this.currentPage = data.page.number + 1;
        this.pageSize = data.page.size;
        this.totalElements = data.page.totalElements;
      });
  }

  handleProductSearch() {
    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;
    this.productService
      .searchProductsByKeywordPaginated(
        keyword,
        this.currentPage - 1,
        this.pageSize
      )
      .subscribe((data) => {
        this.products = data._embedded['products'];
        this.currentPage = data.page.number + 1;
        this.pageSize = data.page.size;
        this.totalElements = data.page.totalElements;
      });
  }
}
