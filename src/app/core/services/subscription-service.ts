import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PlanConfig,
  ProrationPreviewResponseDTO,
  SubscriptionDetailDTO,
  SubscriptionPlan,
  SubscriptionRequestDTO,
  SubscriptionResponseDTO,
  SubscriptionUpgradeRequestDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  getPlans(): Observable<PlanConfig[]> {
    return this.http.get<PlanConfig[]>(`${this.apiUrl}/plans`);
  }

  getCurrentSubscription(): Observable<SubscriptionDetailDTO> {
    return this.http.get<SubscriptionDetailDTO>(`${this.apiUrl}/me`);
  }

  getMySubscription(): Observable<SubscriptionDetailDTO> {
    return this.getCurrentSubscription();
  }

  createSubscription(dto: SubscriptionRequestDTO): Observable<SubscriptionResponseDTO> {
    return this.http.post<SubscriptionResponseDTO>(this.apiUrl, dto);
  }

  getProrationPreview(newPlan: SubscriptionPlan): Observable<ProrationPreviewResponseDTO> {
    return this.http.get<ProrationPreviewResponseDTO>(`${this.apiUrl}/proration-preview?newPlan=${newPlan}`);
  }

  upgradeSubscription(dto: SubscriptionUpgradeRequestDTO): Observable<SubscriptionResponseDTO> {
    return this.http.patch<SubscriptionResponseDTO>(`${this.apiUrl}/upgrade`, dto);
  }
}
