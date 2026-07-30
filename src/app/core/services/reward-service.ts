import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  RewardDetailDTO,
  RewardListDTO,
  RewardRedeemDTO,
  RewardRequestDTO,
  RewardUpdateDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rewards`;

  addReward(dto: RewardRequestDTO): Observable<RewardDetailDTO> {
    return this.http.post<RewardDetailDTO>(this.apiUrl, dto);
  }

  redeemReward(dto: RewardRedeemDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/redeem`, dto);
  }

  updateReward(companyId: number, id: number, dto: RewardUpdateDTO): Observable<RewardDetailDTO> {
    return this.http.put<RewardDetailDTO>(`${this.apiUrl}/${companyId}/${id}`, dto);
  }

  listRewards(companyId: number, page = 0, size = 12): Observable<Page<RewardListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<RewardListDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  getRewardById(companyId: number, id: number): Observable<RewardDetailDTO> {
    return this.http.get<RewardDetailDTO>(`${this.apiUrl}/${companyId}/${id}`);
  }

  enableOrDisableReward(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
