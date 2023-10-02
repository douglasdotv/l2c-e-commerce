import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmbeddedData } from '../common/embedded-data';
import { EmbeddedDataWithPagination } from '../common/embedded-data-with-pagination';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private httpClient: HttpClient) {}

  getProductsByCategoryIdPaginated(
    categoryId: number,
    page: number,
    pageSize: number
  ): Observable<EmbeddedDataWithPagination<Product>> {
    const url = `${this.baseUrl}/products/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<EmbeddedDataWithPagination<Product>>(url);
  }

  getAllProductsPaginated(
    page: number,
    pageSize: number
  ): Observable<EmbeddedDataWithPagination<Product>> {
    const url = `${this.baseUrl}/products?page=${page}&size=${pageSize}`;
    return this.httpClient.get<EmbeddedDataWithPagination<Product>>(url);
  }

  searchProductsByKeywordPaginated(
    keyword: string,
    page: number,
    pageSize: number
  ): Observable<EmbeddedDataWithPagination<Product>> {
    const url = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<EmbeddedDataWithPagination<Product>>(url);
  }

  getProduct(productId: number): Observable<Product> {
    const url = `${this.baseUrl}/products/${productId}`;
    return this.httpClient.get<Product>(url);
  }

  getAllProductCategories(): Observable<ProductCategory[]> {
    const url = `${this.baseUrl}/product-categories`;
    return this.httpClient
      .get<EmbeddedData<ProductCategory>>(url)
      .pipe(map((response) => response._embedded['productCategories']));
  }
}
