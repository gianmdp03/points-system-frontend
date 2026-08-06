import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { CompanyListDTO, Role, Page } from '../../core/models';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
