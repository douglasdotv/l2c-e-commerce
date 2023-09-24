import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private httpClient: HttpClient) {}

  private fetchData<T>(url: string, key: string): Observable<T[]> {
    return this.httpClient
      .get<GetResponse<T>>(url)
      .pipe(map((response) => response._embedded[key]));
  }

  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    const url = `${this.baseUrl}/products/search/findByCategoryId?id=${categoryId}`;
    return this.fetchData<Product>(url, 'products');
  }

  searchProductsByKeyword(keyword: string): Observable<Product[]> {
    const url = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}`;
    return this.fetchData<Product>(url, 'products');
  }

  getProduct(productId: number): Observable<Product> {
    const url = `${this.baseUrl}/products/${productId}`;
    return this.httpClient.get<Product>(url);
  }

  getAllProductCategories(): Observable<ProductCategory[]> {
    const url = `${this.baseUrl}/product-category`;
    return this.fetchData<ProductCategory>(url, 'productCategory');
  }

  getProductsByCategoryIdPaginated(
    categoryId: number,
    page: number,
    pageSize: number
  ): Observable<GetResponsePaginated<Product>> {
    const url = `${this.baseUrl}/products/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponsePaginated<Product>>(url);
  }

  searchProductsByKeywordPaginated(
    keyword: string,
    page: number,
    pageSize: number
  ): Observable<GetResponsePaginated<Product>> {
    const url = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponsePaginated<Product>>(url);
  }

  getAllProductsPaginated(
    page: number,
    pageSize: number
  ): Observable<GetResponsePaginated<Product>> {
    const url = `${this.baseUrl}/products?page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponsePaginated<Product>>(url);
  }
}

interface GetResponse<T> {
  _embedded: {
    [key: string]: T[];
  };
}

interface GetResponsePaginated<T> {
  _embedded: {
    [key: string]: T[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
