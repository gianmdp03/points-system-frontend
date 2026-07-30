import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  SaleDetailDTO,
  SaleListDTO,
  SaleRequestDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  addSale(dto: SaleRequestDTO): Observable<SaleDetailDTO> {
    return this.http.post<SaleDetailDTO>(this.apiUrl, dto);
  }

  listCompaniesSales(
    companyId: number,
    page = 0,
    size = 18,
    sort = 'amount',
    direction = 'DESC'
  ): Observable<Page<SaleListDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    return this.http.get<Page<SaleListDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  getSaleById(companyId: number, id: number): Observable<SaleDetailDTO> {
    return this.http.get<SaleDetailDTO>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
