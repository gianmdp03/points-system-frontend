import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientPublicService } from '../../core/services/client-public-service';
import { AppConfigService } from '../../core/services/app-config-service';
import { AuthService } from '../../core/services/auth-service';
import { AiChatService } from '../../core/services/ai-chat-service';
import { CompanyListDTO, CompanyPublicDetailDTO } from '../../core/models';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';
import { CountrySelectComponent } from '../../components/country-select/country-select';

const STORAGE_KEY_DNI = 'pointly_client_dni';
const STORAGE_KEY_COUNTRY = 'pointly_client_country';

export type CatalogTab = 'rewards' | 'promotions' | 'products';

@Component({
  selector: 'app-client-points-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountrySelectComponent],
  templateUrl: './client-points.html',
  styleUrl: './client-points.css'
})
export class ClientPointsPage implements OnInit {
  protected readonly configService = inject(AppConfigService);
  protected readonly authService = inject(AuthService);
  protected readonly chatService = inject(AiChatService);
  private readonly clientPublicService = inject(ClientPublicService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  readonly searchForm = this.fb.group({
    country: ['Argentina', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    remember: [true]
  });

  readonly isSubmitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly companies = signal<CompanyListDTO[]>([]);
  readonly searchedDni = signal<string>('');
  readonly searchedCountry = signal<string>('');

  // Estado del Catálogo Público
  readonly selectedCompanyCatalog = signal<CompanyPublicDetailDTO | null>(null);
  readonly isLoadingCatalog = signal<boolean>(false);
  readonly catalogErrorMessage = signal<string | null>(null);
  readonly activeCatalogTab = signal<CatalogTab>('rewards');

  ngOnInit(): void {
    // 1. Check Query Params for QR code flow (?dni=...&country=...)
    const queryDni = this.route.snapshot.queryParamMap.get('dni');
    const queryCountry = this.route.snapshot.queryParamMap.get('country');

    if (queryDni) {
      const countryToUse = queryCountry || 'Argentina';
      this.searchForm.patchValue({
        dni: queryDni.trim(),
        country: countryToUse
      });
      this.performSearch(countryToUse, queryDni.trim());
      return;
    }

    // 2. Load from localStorage if previously remembered
    try {
      const savedDni = localStorage.getItem(STORAGE_KEY_DNI);
      const savedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (savedDni) {
        this.searchForm.patchValue({
          dni: savedDni,
          country: savedCountry || 'Argentina'
        });
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  onSearchSubmit(): void {
    this.isSubmitted.set(true);
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { country, dni, remember } = this.searchForm.getRawValue();
    const cleanDni = (dni || '').trim();
    const cleanCountry = (country || 'Argentina').trim();

    if (remember) {
      try {
        localStorage.setItem(STORAGE_KEY_DNI, cleanDni);
        localStorage.setItem(STORAGE_KEY_COUNTRY, cleanCountry);
      } catch {
        // storage fallback
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_DNI);
        localStorage.removeItem(STORAGE_KEY_COUNTRY);
      } catch {
        // storage fallback
      }
    }

    this.performSearch(cleanCountry, cleanDni);
  }

  performSearch(country: string, dni: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.hasSearched.set(true);
    this.searchedDni.set(dni);
    this.searchedCountry.set(country);

    this.clientPublicService.getClientCompanies(country, dni).subscribe({
      next: (page) => {
        this.companies.set(page?.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.companies.set([]);
        const msg = err.status === 404
          ? 'No se encontraron comercios asociados a este DNI y País.'
          : (err.error?.message || 'No fue posible consultar tus puntos. Por favor, intenta de nuevo.');
        this.errorMessage.set(msg);
      }
    });
  }

  clearSearch(): void {
    this.hasSearched.set(false);
    this.companies.set([]);
    this.errorMessage.set(null);
    this.searchForm.patchValue({ dni: '' });
  }

  // Visualización del Catálogo Público (Premios, Promociones activas y Productos)
  viewCompanyCatalog(company: CompanyListDTO): void {
    const country = this.searchedCountry();
    const dni = this.searchedDni();
    if (!country || !dni) return;

    this.isLoadingCatalog.set(true);
    this.catalogErrorMessage.set(null);
    this.activeCatalogTab.set('rewards');

    this.clientPublicService.getCompanyPublicDetail(country, dni, company.id).subscribe({
      next: (detail) => {
        this.selectedCompanyCatalog.set(detail);
        this.isLoadingCatalog.set(false);
      },
      error: (err) => {
        this.isLoadingCatalog.set(false);
        this.catalogErrorMessage.set(
          err.status === 404 || err.status === 403
            ? (err.error?.message || 'Solo puedes consultar el catálogo de comercios a los que estés asociado.')
            : 'Error al consultar el catálogo del comercio.'
        );
      }
    });
  }

  closeCatalogModal(): void {
    this.selectedCompanyCatalog.set(null);
    this.catalogErrorMessage.set(null);
  }

  setCatalogTab(tab: CatalogTab): void {
    this.activeCatalogTab.set(tab);
  }

  askAiAboutCompany(companyName: string): void {
    this.closeCatalogModal();
    this.chatService.openChat();
    this.chatService.sendMessage(`¿Cómo funcionan los puntos, promociones activas y premios en "${companyName}"?`);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}

