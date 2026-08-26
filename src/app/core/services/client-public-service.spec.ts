import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientPublicService } from './client-public-service';
import { environment } from '../../../environments/environment';

describe('ClientPublicService', () => {
  let service: ClientPublicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClientPublicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCompanyName should call /api/public/companies/{id}/name', () => {
    const mockResponse = { id: 10, name: 'Café Test' };

    service.getCompanyName(10).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/public/companies/10/name`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
