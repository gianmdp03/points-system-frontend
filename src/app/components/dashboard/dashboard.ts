import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { CompanyListDTO, Role, CompanyRequestDTO, CompanyUpdateDTO } from '../../core/models';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';

// Sub-components
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header';
import { RoleAdminViewComponent } from './components/role-admin-view/role-admin-view';
import { RoleAppAdminViewComponent } from './components/role-app-admin-view/role-app-admin-view';
import { AddCompanyModalComponent } from './components/modals/add-company-modal/add-company-modal';
import { DashboardEditCompanyModalComponent } from './components/modals/edit-company-modal/edit-company-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardHeaderComponent,
    RoleAdminViewComponent,
    RoleAppAdminViewComponent,
    AddCompanyModalComponent,
    DashboardEditCompanyModalComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  protected readonly companyService = inject(CompanyService);
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;
  readonly RoleEnum = Role;

  // Signals for state
  readonly currentRole = computed(() => this.authService.currentRole());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  readonly adminCompanies = signal<CompanyListDTO[]>([]);
  readonly allCompanies = signal<CompanyListDTO[]>([]);
  
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly modalErrorMessage = signal<string | null>(null);

  // Modales
  readonly showAddCompanyModal = signal<boolean>(false);
  readonly showEditCompanyModal = signal<boolean>(false);
  readonly isAddCompanySubmitted = signal<boolean>(false);
  readonly isEditCompanySubmitted = signal<boolean>(false);

  selectedCompanyForEdit = signal<CompanyListDTO | null>(null);

  addCompanyForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(300)]],
    amountStep: [100, [Validators.required, Validators.min(1)]],
    pointsPerStep: [10, [Validators.required, Validators.min(1)]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    province: ['', [Validators.required]],
    country: ['Argentina', [Validators.required]],
    zipCode: ['', [Validators.required]]
  });

  editCompanyForm = this.fb.group({
    id: [0, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(300)]],
    amountStep: [100, [Validators.required, Validators.min(1)]],
    pointsPerStep: [10, [Validators.required, Validators.min(1)]],
    isEnabled: [true, [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    province: ['', [Validators.required]],
    country: ['Argentina', [Validators.required]],
    zipCode: ['', [Validators.required]]
  });

  openAddCompanyModal(): void {
    this.modalErrorMessage.set(null);
    this.isAddCompanySubmitted.set(false);
    this.addCompanyForm.reset({
      name: '',
      amountStep: 100,
      pointsPerStep: 10,
      address: '',
      city: '',
      province: '',
      country: 'Argentina',
      zipCode: ''
    });
    this.showAddCompanyModal.set(true);
  }

  closeAddCompanyModal(): void {
    this.showAddCompanyModal.set(false);
    this.modalErrorMessage.set(null);
  }

  openEditCompanyModal(company?: CompanyListDTO): void {
    this.modalErrorMessage.set(null);
    this.isEditCompanySubmitted.set(false);

    const comp = company || this.adminCompanies()[0] || this.allCompanies()[0];
    if (comp) {
      this.selectedCompanyForEdit.set(comp);
      this.editCompanyForm.patchValue({
        id: comp.id,
        name: comp.name,
        amountStep: comp.amountStep,
        pointsPerStep: comp.pointsPerStep,
        isEnabled: comp.isEnabled,
        address: comp.companyDetails?.address || '',
        city: comp.companyDetails?.city || '',
        province: comp.companyDetails?.province || '',
        country: comp.companyDetails?.country || 'Argentina',
        zipCode: comp.companyDetails?.zipCode || ''
      });
    }
    this.showEditCompanyModal.set(true);
  }

  closeEditCompanyModal(): void {
    this.showEditCompanyModal.set(false);
    this.modalErrorMessage.set(null);
  }

  constructor() {
    effect(() => {
      const role = this.currentRole();
      if (this.isLoggedIn()) {
        this.loadRoleData(role, 0);
      }
    });
  }

  ngOnInit(): void {
    // Rely on constructor effect
  }

  setRole(role: Role): void {
    this.authService.setRole(role);
  }

  loadRoleData(role: Role, page = 0): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.currentPage.set(page);

    const activeRole = role;

    if (role === Role.COMPANY_ADMIN) {
      this.companyService.listMyAdminCompanies(page, 18).subscribe({
        next: (pageData: any) => {
          if (this.currentRole() !== activeRole) return;
          this.isLoading.set(false);
          this.errorMessage.set(null);
          const items = Array.isArray(pageData) ? pageData : (pageData?.content || []);
          const total = Array.isArray(pageData) ? pageData.length : (pageData?.totalElements ?? items.length);

          this.adminCompanies.set(items);
          this.totalElements.set(total);
          this.totalPages.set(pageData?.totalPages || 1);
        },
        error: (err) => {
          if (this.currentRole() !== activeRole) return;
          this.isLoading.set(false);
          this.adminCompanies.set([]);
          this.totalElements.set(0);
          const msg = err.status === 401 || err.status === 403
            ? 'No tienes permisos para listar tus empresas administradas.'
            : (err.error?.message || 'Error al conectar con el servidor backend.');
          this.errorMessage.set(msg);
        }
      });
    } else if (role === Role.APP_ADMIN) {
      this.companyService.listCompanies(page, 18).subscribe({
        next: (pageData: any) => {
          if (this.currentRole() !== activeRole) return;
          this.isLoading.set(false);
          this.errorMessage.set(null);
          const items = Array.isArray(pageData) ? pageData : (pageData?.content || []);
          const total = Array.isArray(pageData) ? pageData.length : (pageData?.totalElements ?? items.length);

          this.allCompanies.set(items);
          this.totalElements.set(total);
          this.totalPages.set(pageData?.totalPages || 1);
        },
        error: (err) => {
          if (this.currentRole() !== activeRole) return;
          this.isLoading.set(false);
          this.allCompanies.set([]);
          this.totalElements.set(0);
          const msg = err.status === 401 || err.status === 403
            ? 'Se requiere rol APP_ADMIN para ver todas las empresas.'
            : (err.error?.message || 'Error al conectar con el servidor backend.');
          this.errorMessage.set(msg);
        }
      });
    }
  }

  onAddCompanySubmit(): void {
    this.isAddCompanySubmitted.set(true);
    if (this.addCompanyForm.invalid) {
      this.addCompanyForm.markAllAsTouched();
      return;
    }

    const val = this.addCompanyForm.getRawValue();

    const dto: CompanyRequestDTO = {
      name: val.name!,
      amountStep: Number(val.amountStep),
      pointsPerStep: Number(val.pointsPerStep),
      companyDetails: {
        country: val.country!,
        province: val.province!,
        city: val.city!,
        address: val.address!,
        zipCode: val.zipCode!
      }
    };

    this.modalErrorMessage.set(null);

    this.companyService.addCompany(dto).subscribe({
      next: () => {
        this.closeAddCompanyModal();
        this.loadRoleData(this.currentRole(), this.currentPage());
      },
      error: (err) => {
        this.modalErrorMessage.set(err.error?.message || 'Error al crear la empresa.');
      }
    });
  }

  onEditCompanySubmit(): void {
    this.isEditCompanySubmitted.set(true);
    if (this.editCompanyForm.invalid) {
      this.editCompanyForm.markAllAsTouched();
      return;
    }

    const val = this.editCompanyForm.getRawValue();

    const dto: CompanyUpdateDTO = {
      name: val.name!,
      amountStep: Number(val.amountStep),
      pointsPerStep: Number(val.pointsPerStep),
      companyDetails: {
        country: val.country!,
        province: val.province!,
        city: val.city!,
        address: val.address!,
        zipCode: val.zipCode!
      }
    };

    this.modalErrorMessage.set(null);

    this.companyService.updateCompany(val.id!, dto).subscribe({
      next: () => {
        this.closeEditCompanyModal();
        this.loadRoleData(this.currentRole(), this.currentPage());
      },
      error: (err) => {
        this.modalErrorMessage.set(err.error?.message || 'Error al actualizar la empresa.');
      }
    });
  }

  toggleCompanyStatus(company: CompanyListDTO): void {
    const action = company.isEnabled
      ? this.companyService.disableCompany(company.id)
      : this.companyService.enableCompany(company.id);

    action.subscribe({
      next: () => {
        this.loadRoleData(this.currentRole(), this.currentPage());
      },
      error: (err) => {
        alert('Error al cambiar el estado de la empresa: ' + (err.error?.message || err.message));
      }
    });
  }
}
