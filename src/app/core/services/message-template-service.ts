import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  MessageTemplateDetailDTO,
  MessageTemplateListDTO,
  MessageTemplateRequestDTO,
  MessageTemplateUpdateDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageTemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/message-templates`;

  addTemplate(dto: MessageTemplateRequestDTO): Observable<MessageTemplateDetailDTO> {
    return this.http.post<MessageTemplateDetailDTO>(this.apiUrl, dto);
  }

  updateTemplate(companyId: number, id: number, dto: MessageTemplateUpdateDTO): Observable<MessageTemplateDetailDTO> {
    return this.http.put<MessageTemplateDetailDTO>(`${this.apiUrl}/${companyId}/${id}`, dto);
  }

  listTemplates(companyId: number, page = 0, size = 12): Observable<Page<MessageTemplateListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<MessageTemplateListDTO>>(`${this.apiUrl}/${companyId}`, { params });
  }

  getTemplateById(companyId: number, id: number): Observable<MessageTemplateDetailDTO> {
    return this.http.get<MessageTemplateDetailDTO>(`${this.apiUrl}/${companyId}/${id}`);
  }

  enableOrDisableTemplate(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  resetDefaultTemplates(companyId: number): Observable<MessageTemplateDetailDTO[]> {
    return this.http.post<MessageTemplateDetailDTO[]>(`${this.apiUrl}/${companyId}/reset-defaults`, {});
  }
}