import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { form, required, min, FormField } from '@angular/forms/signals';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { CompanyListDTO, CompanyRequestDTO, Role, Page } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormField],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  protected readonly companyService = inject(CompanyService);
  protected readonly authService = inject(AuthService);

  readonly RoleEnum = Role;

  // Signals for state
  readonly currentRole = computed(() => this.authService.currentRole());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  readonly subscribedCompanies = signal<CompanyListDTO[]>([]);
  readonly adminCompanies = signal<CompanyListDTO[]>([]);
  readonly allCompanies = signal<CompanyListDTO[]>([]);
  
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Modal Crear Empresa Signals & Signal Form
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly createLoading = signal<boolean>(false);
  readonly createError = signal<string | null>(null);

  readonly createCompanyModel = signal({
    name: '',
    userDni: '',
    address: '',
    city: '',
    province: '',
    country: 'Argentina',
    zipCode: '',
    amountStep: 100,
    pointsPerStep: 10
  });

  readonly createCompanyForm = form(this.createCompanyModel, (f) => {
    required(f.name);
    required(f.userDni);
    required(f.amountStep);
    min(f.amountStep, 1);
    required(f.pointsPerStep);
    min(f.pointsPerStep, 1);
  });

  constructor() {
    // Re-fetch data whenever active role or logged in status changes
    effect(() => {
      const role = this.currentRole();
      if (this.isLoggedIn()) {
        this.loadRoleData(role, 0);
      }
    });
  }

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.loadRoleData(this.currentRole(), 0);
    }
  }

  setRole(role: Role): void {
    this.authService.setRole(role);
  }

  openCreateModal(): void {
    const defaultDni = this.authService.userProfile()?.dni || '';
    this.createCompanyModel.set({
      name: '',
      userDni: defaultDni,
      address: '',
      city: '',
      province: '',
      country: 'Argentina',
      zipCode: '',
      amountStep: 100,
      pointsPerStep: 10
    });
    this.createError.set(null);
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.createError.set(null);
  }

  submitCreateCompany(): void {
    if (this.createCompanyForm().invalid()) {
      this.createError.set('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const formVal = this.createCompanyModel();
    const dni = formVal.userDni.trim();

    const dto: CompanyRequestDTO = {
      name: formVal.name.trim(),
      companyDetails: {
        address: formVal.address.trim(),
        city: formVal.city.trim(),
        province: formVal.province.trim(),
        country: formVal.country.trim(),
        zipCode: formVal.zipCode.trim()
      },
      amountStep: Number(formVal.amountStep) || 1,
      pointsPerStep: Number(formVal.pointsPerStep) || 1
    };

    this.createLoading.set(true);
    this.createError.set(null);

    this.companyService.addCompany(dni, dto).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreateModal();
        this.loadRoleData(this.currentRole(), this.currentPage());
      },
      error: (err) => {
        this.createLoading.set(false);
        const msg = err.error?.message || err.message || 'Error al crear la empresa.';
        this.createError.set(msg);
      }
    });
  }

  loadRoleData(role: Role, page = 0): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.currentPage.set(page);

    if (role === Role.USER) {
      this.companyService.listMySubscribedCompanies(page, 18).subscribe({
        next: (pageData: Page<CompanyListDTO>) => {
          this.isLoading.set(false);
          this.subscribedCompanies.set(pageData?.content || []);
          this.totalElements.set(pageData?.totalElements || 0);
          this.totalPages.set(pageData?.totalPages || 0);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.subscribedCompanies.set([]);
          const msg = err.status === 401 || err.status === 403
            ? 'No tienes permisos o no te has autenticado correctamente.'
            : (err.error?.message || 'Error al conectar con el servidor backend.');
          this.errorMessage.set(msg);
        }
      });
    } else if (role === Role.COMPANY_ADMIN) {
      this.companyService.listMyAdminCompanies(page, 18).subscribe({
        next: (pageData: Page<CompanyListDTO>) => {
          this.isLoading.set(false);
          this.adminCompanies.set(pageData?.content || []);
          this.totalElements.set(pageData?.totalElements || 0);
          this.totalPages.set(pageData?.totalPages || 0);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.adminCompanies.set([]);
          const msg = err.status === 401 || err.status === 403
            ? 'No tienes permisos para listar tus empresas administradas.'
            : (err.error?.message || 'Error al conectar con el servidor backend.');
          this.errorMessage.set(msg);
        }
      });
    } else if (role === Role.APP_ADMIN) {
      this.companyService.listCompanies(page, 18).subscribe({
        next: (pageData: Page<CompanyListDTO>) => {
          this.isLoading.set(false);
          this.allCompanies.set(pageData?.content || []);
          this.totalElements.set(pageData?.totalElements || 0);
          this.totalPages.set(pageData?.totalPages || 0);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.allCompanies.set([]);
          const msg = err.status === 401 || err.status === 403
            ? 'Se requiere rol APP_ADMIN para ver todas las empresas.'
            : (err.error?.message || 'Error al conectar con el servidor backend.');
          this.errorMessage.set(msg);
        }
      });
    }
  }

  toggleCompanyStatus(company: CompanyListDTO): void {
    if (company.isEnabled) {
      this.companyService.disableCompany(company.id).subscribe({
        next: () => {
          company.isEnabled = false;
          this.loadRoleData(this.currentRole(), this.currentPage());
        },
        error: (err) => alert('Error al deshabilitar empresa: ' + (err.error?.message || err.message))
      });
    } else {
      this.companyService.enableCompany(company.id).subscribe({
        next: () => {
          company.isEnabled = true;
          this.loadRoleData(this.currentRole(), this.currentPage());
        },
        error: (err) => alert('Error al habilitar empresa: ' + (err.error?.message || err.message))
      });
    }
  }
}
