import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  PointsAccountDetailDTO,
  PointsAccountRequestDTO,
  PointsTransactionDetailDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PointsAccountService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/points-accounts`;

  registerClientAndCreateAccount(dto: PointsAccountRequestDTO): Observable<PointsAccountDetailDTO> {
    return this.http.post<PointsAccountDetailDTO>(this.apiUrl, dto);
  }

  listPointsAccounts(companyId: number, page = 0, size = 10): Observable<Page<PointsAccountDetailDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PointsAccountDetailDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  listInactiveClients(companyId: number, days = 30, page = 0, size = 10): Observable<Page<PointsAccountDetailDTO>> {
    const params = new HttpParams()
      .set('days', days.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PointsAccountDetailDTO>>(`${this.apiUrl}/${companyId}/inactive`, { params });
  }

  getTransactionHistory(
    clientId: number,
    companyId: number,
    page = 0,
    size = 10,
    sort = 'createdAt',
    direction = 'DESC'
  ): Observable<Page<PointsTransactionDetailDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    return this.http.get<Page<PointsTransactionDetailDTO>>(`${this.apiUrl}/history/${clientId}/${companyId}`, { params });
  }
}