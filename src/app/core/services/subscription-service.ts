import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PlanConfig,
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

  getPlans(): Observable<PlanConfig[]> {
    return this.http.get<PlanConfig[]>(`${this.apiUrl}/plans`);
  }

  getCurrentSubscription(preapprovalId?: string | null): Observable<SubscriptionDetailDTO> {
    const query = preapprovalId ? `?preapproval_id=${encodeURIComponent(preapprovalId)}` : '';
    return this.http.get<SubscriptionDetailDTO>(`${this.apiUrl}/me${query}`);
  }

  getMySubscription(preapprovalId?: string | null): Observable<SubscriptionDetailDTO> {
    return this.getCurrentSubscription(preapprovalId);
  }

  confirmSubscription(preapprovalId: string): Observable<SubscriptionDetailDTO> {
    return this.http.post<SubscriptionDetailDTO>(`${this.apiUrl}/confirm?preapprovalId=${encodeURIComponent(preapprovalId)}`, {});
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
