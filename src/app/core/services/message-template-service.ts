import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  MessageTemplateDetailDTO,
  MessageTemplateListDTO,
  MessageTemplateRequestDTO,
  MessageTemplateUpdateDTO,
  CreateMessageTemplateDTO,
  UpdateMessageTemplateDTO,
  NotificationType
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageTemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/message-templates`;

  getAllByCompany(companyId: number): Observable<MessageTemplateDetailDTO[]> {
    return this.http.get<MessageTemplateDetailDTO[]>(`${this.apiUrl}/${companyId}/all`);
  }

  createTemplate(dto: CreateMessageTemplateDTO): Observable<MessageTemplateDetailDTO> {
    return this.http.post<MessageTemplateDetailDTO>(this.apiUrl, dto);
  }

  addTemplate(dto: MessageTemplateRequestDTO): Observable<MessageTemplateDetailDTO> {
    return this.createTemplate(dto);
  }

  updateTemplate(companyId: number, id: number, dto: UpdateMessageTemplateDTO): Observable<MessageTemplateDetailDTO> {
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

  toggleTemplate(companyId: number, id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${companyId}/${id}/toggle`, {});
  }

  enableOrDisableTemplate(companyId: number, id: number): Observable<void> {
    return this.toggleTemplate(companyId, id);
  }

  deleteTemplate(companyId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}/permanent`);
  }

  resetDefaults(companyId: number): Observable<MessageTemplateDetailDTO[]> {
    return this.http.post<MessageTemplateDetailDTO[]>(`${this.apiUrl}/${companyId}/reset-defaults`, {});
  }

  resetDefaultTemplates(companyId: number): Observable<MessageTemplateDetailDTO[]> {
    return this.resetDefaults(companyId);
  }

  getRandomPreview(companyId: number, type: NotificationType): Observable<MessageTemplateDetailDTO> {
    const params = new HttpParams().set('type', type);
    return this.http.get<MessageTemplateDetailDTO>(`${this.apiUrl}/${companyId}/random-preview`, { params });
  }
}
