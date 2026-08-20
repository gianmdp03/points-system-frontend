import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SubscriptionDetailDTO,
  SubscriptionPlan,
  SubscriptionRequestDTO,
  SubscriptionResponseDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  getCurrentSubscription(): Observable<SubscriptionDetailDTO> {
    return this.http.get<SubscriptionDetailDTO>(`${this.apiUrl}/me`);
  }

  getMySubscription(): Observable<SubscriptionDetailDTO> {
    return this.getCurrentSubscription();
  }

  createSubscription(dto: SubscriptionRequestDTO): Observable<SubscriptionResponseDTO> {
    return this.http.post<SubscriptionResponseDTO>(this.apiUrl, dto);
  }

  changeSubscriptionPlan(newPlan: SubscriptionPlan): Observable<SubscriptionDetailDTO> {
    return this.http.patch<SubscriptionDetailDTO>(`${this.apiUrl}/change-plan?newPlan=${newPlan}`, {});
  }

  upgradeSubscription(newPlan: SubscriptionPlan): Observable<SubscriptionDetailDTO> {
    return this.changeSubscriptionPlan(newPlan);
  }

  cancelSubscription(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cancel`);
  }
}
