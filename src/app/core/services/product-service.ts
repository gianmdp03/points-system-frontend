import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  ProductDetailDTO,
  ProductListDTO,
  ProductRequestDTO,
  ProductUpdateDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  addProduct(dto: ProductRequestDTO): Observable<ProductDetailDTO> {
    return this.http.post<ProductDetailDTO>(this.apiUrl, dto);
  }

  listProducts(companyId: number, page = 0, size = 12): Observable<Page<ProductListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ProductListDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  updateProduct(companyId: number, id: number, dto: ProductUpdateDTO): Observable<ProductDetailDTO> {
    return this.http.put<ProductDetailDTO>(`${this.apiUrl}/${companyId}/${id}`, dto);
  }

  getProductById(id: number): Observable<ProductDetailDTO> {
    return this.http.get<ProductDetailDTO>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
