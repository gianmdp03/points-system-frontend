import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyListDTO, CompanyPublicDetailDTO, Page, PointsAccountDetailDTO } from '../models';
import { ClientJoinRequestDTO } from '../models/client.model';

export interface CompanyNameDTO {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientPublicService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public`;

  getClientCompanies(
    country: string,
    dni: string,
    page = 0,
    size = 18,
    sort = 'name',
    direction = 'DESC'
  ): Observable<Page<CompanyListDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    const encodedCountry = encodeURIComponent(country.trim());
    const encodedDni = encodeURIComponent(dni.trim());
    return this.http.get<Page<CompanyListDTO>>(`${this.apiUrl}/clients/${encodedCountry}/${encodedDni}/companies`, { params });
  }

  getCompanyPublicDetail(country: string, dni: string, companyId: number): Observable<CompanyPublicDetailDTO> {
    const encodedCountry = encodeURIComponent(country.trim());
    const encodedDni = encodeURIComponent(dni.trim());
    return this.http.get<CompanyPublicDetailDTO>(`${this.apiUrl}/clients/${encodedCountry}/${encodedDni}/companies/${companyId}`);
  }

  joinCompany(dto: ClientJoinRequestDTO): Observable<PointsAccountDetailDTO> {
    return this.http.post<PointsAccountDetailDTO>(`${this.apiUrl}/clients/join`, dto);
  }

  updateNotificationPreference(country: string, dni: string, isNotificationEnabled: boolean): Observable<void> {
    const encodedCountry = encodeURIComponent(country.trim());
    const encodedDni = encodeURIComponent(dni.trim());
    return this.http.patch<void>(`${this.apiUrl}/clients/${encodedCountry}/${encodedDni}/notifications`, { isNotificationEnabled });
  }

  getCompanyName(companyId: number): Observable<CompanyNameDTO> {
    return this.http.get<CompanyNameDTO>(`${this.apiUrl}/companies/${companyId}/name`);
  }
}

