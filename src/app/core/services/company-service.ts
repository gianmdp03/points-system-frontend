import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CompanyDetailDTO,
  CompanyListDTO,
  CompanyRequestDTO,
  CompanyUpdateDTO,
  Page
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/companies`;

  addCompany(dto: CompanyRequestDTO): Observable<CompanyDetailDTO> {
    return this.http.post<CompanyDetailDTO>(this.apiUrl, dto);
  }

  updateCompany(id: number, dto: CompanyUpdateDTO): Observable<CompanyDetailDTO> {
    return this.http.patch<CompanyDetailDTO>(`${this.apiUrl}/${id}`, dto);
  }

  listCompanies(page = 0, size = 18, sort = 'name', direction = 'DESC'): Observable<Page<CompanyListDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    return this.http.get<Page<CompanyListDTO>>(this.apiUrl, { params });
  }

  getCompanyById(id: number): Observable<CompanyDetailDTO> {
    return this.http.get<CompanyDetailDTO>(`${this.apiUrl}/${id}`);
  }

  disableCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/disable/${companyId}`);
  }

  enableCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enable/${companyId}`);
  }

  listMyAdminCompanies(page = 0, size = 18, sort = 'name', direction = 'DESC'): Observable<Page<CompanyListDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    return this.http.get<Page<CompanyListDTO>>(`${this.apiUrl}/my-companies`, { params });
  }

  listMySubscribedCompanies(page = 0, size = 18, sort = 'name', direction = 'DESC'): Observable<Page<CompanyListDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', `${sort},${direction.toLowerCase()}`);
    }
    return this.http.get<Page<CompanyListDTO>>(`${this.apiUrl}/my-subscriptions`, { params });
  }
}

