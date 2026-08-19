import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SubscriptionDetailDTO,
  SubscriptionRequestDTO,
  SubscriptionResponseDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  createSubscription(dto: SubscriptionRequestDTO): Observable<SubscriptionResponseDTO> {
    return this.http.post<SubscriptionResponseDTO>(this.apiUrl, dto);
  }

  getMySubscription(): Observable<SubscriptionDetailDTO> {
    return this.http.get<SubscriptionDetailDTO>(`${this.apiUrl}/me`);
  }

  cancelSubscription(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cancel`);
  }
}
