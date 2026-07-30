import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  PromotionDetailDTO,
  PromotionListDTO,
  PromotionRequestDTO,
  PromotionUpdateDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/promotions`;

  addPromotion(dto: PromotionRequestDTO): Observable<PromotionDetailDTO> {
    return this.http.post<PromotionDetailDTO>(this.apiUrl, dto);
  }

  updatePromotion(companyId: number, id: number, dto: PromotionUpdateDTO): Observable<PromotionDetailDTO> {
    return this.http.patch<PromotionDetailDTO>(`${this.apiUrl}/${companyId}/${id}`, dto);
  }

  listPromotions(companyId: number, page = 0, size = 10): Observable<Page<PromotionListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PromotionListDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  getPromotionById(companyId: number, id: number): Observable<PromotionDetailDTO> {
    return this.http.get<PromotionDetailDTO>(`${this.apiUrl}/${companyId}/${id}`);
  }

  enabledOrDisabled(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
