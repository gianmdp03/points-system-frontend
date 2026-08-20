import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { CompanyService } from '../../core/services/company-service';
import { PointsAccountService } from '../../core/services/points-account-service';
import { SaleService } from '../../core/services/sale-service';
import { PromotionService } from '../../core/services/promotion-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import { PlanLimitModalService } from '../../core/services/plan-limit-modal-service';
import {
  CompanyListDTO,
  CompanyRequestDTO,
  PointsAccountRequestDTO,
  PromotionListDTO,
  Role,
  SaleRequestDTO,
  SubscriptionPlan
} from '../../core/models';

import { ClientModalComponent } from '../../pages/company-detail/components/modals/client-modal/client-modal';
import { SaleModalComponent } from '../../pages/company-detail/components/modals/sale-modal/sale-modal';
import { AddCompanyModalComponent } from '../dashboard/components/modals/add-company-modal/add-company-modal';
import { CheckPointsModalComponent } from './modals/check-points-modal/check-points-modal';

@Component({
  selector: 'app-company-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ClientModalComponent,
    SaleModalComponent,
    AddCompanyModalComponent,
    CheckPointsModalComponent
  ],
  templateUrl: './company-quick-actions.html',
  styleUrl: './company-quick-actions.css'
})
export class CompanyQuickActionsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly companyService = inject(CompanyService);
  protected readonly pointsAccountService = inject(PointsAccountService);
  protected readonly saleService = inject(SaleService);
  protected readonly promotionService = inject(PromotionService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  protected readonly planLimitModalService = inject(PlanLimitModalService);

  readonly RoleEnum = Role;
  readonly SubscriptionPlanEnum = SubscriptionPlan;

  // Visibility guard
  readonly isCompanyAdmin = computed(() => {
    return this.authService.isLoggedIn() && this.authService.currentRole() === Role.COMPANY_ADMIN;
  });

  readonly companies = signal<CompanyListDTO[]>([]);
  readonly selectedCompany = signal<CompanyListDTO | null>(null);
  readonly activePromotion = signal<PromotionListDTO | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPromoLoading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

  // Modals Visibility
  readonly showAddClientModal = signal<boolean>(false);
  readonly isAddClientSubmitted = signal<boolean>(false);
  readonly isClientLoading = signal<boolean>(false);
  readonly clientErrorMessage = signal<string | null>(null);

  readonly showAddSaleModal = signal<boolean>(false);
  readonly isAddSaleSubmitted = signal<boolean>(false);
  readonly isSaleLoading = signal<boolean>(false);
  readonly saleErrorMessage = signal<string | null>(null);

  readonly showAddCompanyModal = signal<boolean>(false);
  readonly isAddCompanySubmitted = signal<boolean>(false);
  readonly isCompanyLoading = signal<boolean>(false);
  readonly companyErrorMessage = signal<string | null>(null);

  readonly showCheckPointsModal = signal<boolean>(false);

  // Reactive Forms
  addClientForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.email]],
    phone: ['']
  });

  addSaleForm = this.fb.group({
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    amount: [1000, [Validators.required, Validators.min(1)]]
  });

  addCompanyForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(300)]],
    amountStep: [100, [Validators.required, Validators.min(1)]],
    pointsPerStep: [10, [Validators.required, Validators.min(1)]],
    isPointsExpirationEnabled: [false],
    pointsExpirationDays: [null as number | null],
    isInactiveClientPurgeEnabled: [false],
    inactiveClientPurgeDays: [null as number | null],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    province: ['', [Validators.required, Validators.maxLength(100)]],
    country: ['Argentina', [Validators.required, Validators.maxLength(100)]],
    zipCode: ['', [Validators.required, Validators.maxLength(20)]]
  });

  private setupExpirationValidators(): void {
    this.addCompanyForm.get('isPointsExpirationEnabled')?.valueChanges.subscribe((enabled: boolean | null) => {
      const daysControl = this.addCompanyForm.get('pointsExpirationDays');
      if (enabled) {
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
        if (!daysControl?.value) {
          daysControl?.setValue(30);
        }
      } else {
        daysControl?.clearValidators();
        daysControl?.setValue(null);
      }
      daysControl?.updateValueAndValidity();
    });

    this.addCompanyForm.get('isInactiveClientPurgeEnabled')?.valueChanges.subscribe((enabled: boolean | null) => {
      const daysControl = this.addCompanyForm.get('inactiveClientPurgeDays');
      if (enabled) {
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
        if (!daysControl?.value) {
          daysControl?.setValue(180);
        }
      } else {
        daysControl?.clearValidators();
        daysControl?.setValue(null);
      }
      daysControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.setupExpirationValidators();
    if (this.isCompanyAdmin()) {
      this.loadCompanies();
    }
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.companyService.listMyAdminCompanies(0, 50).subscribe({
      next: (page) => {
        const list = page?.content || [];
        this.companies.set(list);
        this.isLoading.set(false);

        if (list.length > 0) {
          // Keep currently selected if exists in list, otherwise select first
          const current = this.selectedCompany();
          const match = current ? list.find(c => c.id === current.id) : null;
          const target = match || list[0];
          this.onSelectCompany(target);
        } else {
          this.selectedCompany.set(null);
          this.activePromotion.set(null);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSelectCompany(company: CompanyListDTO): void {
    this.selectedCompany.set(company);
    this.fetchActivePromotion(company.id);
  }

  fetchActivePromotion(companyId: number): void {
    this.isPromoLoading.set(true);
    this.promotionService.listPromotions(companyId).subscribe({
      next: (page) => {
        this.isPromoLoading.set(false);
        const promos = page?.content || [];
        const now = new Date();
        const active = promos.find((p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return now >= start && now <= end;
        });
        this.activePromotion.set(active || null);
      },
      error: () => {
        this.isPromoLoading.set(false);
        this.activePromotion.set(null);
      }
    });
  }

  // --- Modal Openers & Handlers ---
  openAddClientModal(): void {
    const comp = this.selectedCompany();
    if (!comp) return;

    if (this.subscriptionState.currentPlan() === SubscriptionPlan.NONE) {
      this.planLimitModalService.open({
        title: 'Sin Plan Activo',
        message: 'No posees un plan activo para registrar clientes. Por favor, selecciona un plan para continuar.',
        targetPlan: SubscriptionPlan.BASIC,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    this.isAddClientSubmitted.set(false);
    this.clientErrorMessage.set(null);
    this.addClientForm.reset({
      country: comp.companyDetails?.country || 'Argentina',
      name: '',
      dni: '',
      email: '',
      phone: ''
    });
    this.showAddClientModal.set(true);
  }

  closeAddClientModal(): void {
    this.showAddClientModal.set(false);
  }

  onAddClientSubmit(): void {
    this.isAddClientSubmitted.set(true);
    const comp = this.selectedCompany();
    if (this.addClientForm.invalid || !comp) {
      this.addClientForm.markAllAsTouched();
      return;
    }

    const val = this.addClientForm.getRawValue();
    const dto: PointsAccountRequestDTO = {
      companyId: comp.id,
      dni: val.dni!,
      country: val.country!,
      name: val.name!,
      email: val.email || undefined,
      phone: val.phone || undefined
    };

    this.isClientLoading.set(true);
    this.clientErrorMessage.set(null);

    this.pointsAccountService.registerClientAndCreateAccount(dto).subscribe({
      next: () => {
        this.isClientLoading.set(false);
        this.closeAddClientModal();
        this.showToast(`¡Cliente "${dto.name}" asociado exitosamente!`);
      },
      error: (err) => {
        this.isClientLoading.set(false);
        this.clientErrorMessage.set(err.error?.message || 'Error al registrar el cliente.');
      }
    });
  }

  openAddSaleModal(initialData?: { dni?: string; country?: string }): void {
    const comp = this.selectedCompany();
    if (!comp) return;

    if (this.subscriptionState.currentPlan() === SubscriptionPlan.NONE) {
      this.planLimitModalService.open({
        title: 'Sin Plan Activo',
        message: 'No posees un plan activo para registrar ventas y otorgar puntos.',
        targetPlan: SubscriptionPlan.BASIC,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    this.isAddSaleSubmitted.set(false);
    this.saleErrorMessage.set(null);
    this.addSaleForm.reset({
      country: initialData?.country || comp.companyDetails?.country || 'Argentina',
      dni: initialData?.dni || '',
      amount: 1000
    });
    this.showAddSaleModal.set(true);
  }

  closeAddSaleModal(): void {
    this.showAddSaleModal.set(false);
  }

  onAddSaleSubmit(): void {
    this.isAddSaleSubmitted.set(true);
    const comp = this.selectedCompany();
    if (this.addSaleForm.invalid || !comp) {
      this.addSaleForm.markAllAsTouched();
      return;
    }

    const val = this.addSaleForm.getRawValue();
    const dto: SaleRequestDTO = {
      companyId: comp.id,
      dni: val.dni!,
      country: val.country!,
      amount: Number(val.amount)
    };

    this.isSaleLoading.set(true);
    this.saleErrorMessage.set(null);

    this.saleService.addSale(dto).subscribe({
      next: (res) => {
        this.isSaleLoading.set(false);
        this.closeAddSaleModal();
        const pts = res.pointsGenerated ? ` (+${res.pointsGenerated} pts)` : '';
        this.showToast(`¡Venta por $${dto.amount} registrada exitosamente${pts}!`);
      },
      error: (err) => {
        this.isSaleLoading.set(false);
        this.saleErrorMessage.set(err.error?.message || 'Error al registrar la venta.');
      }
    });
  }

  openCheckPointsModal(): void {
    const comp = this.selectedCompany();
    if (!comp) return;
    this.showCheckPointsModal.set(true);
  }

  closeCheckPointsModal(): void {
    this.showCheckPointsModal.set(false);
  }

  onCheckPointsGoToSale(data: { dni: string; country: string }): void {
    this.closeCheckPointsModal();
    this.openAddSaleModal(data);
  }

  openAddCompanyModal(): void {
    if (this.subscriptionState.currentPlan() === SubscriptionPlan.NONE) {
      this.planLimitModalService.open({
        title: 'Sin Plan Activo',
        message: 'No posees un plan activo para crear empresas. Por favor, selecciona un plan para comenzar.',
        targetPlan: SubscriptionPlan.BASIC,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    const max = this.subscriptionState.maxCompanies();
    if (max !== -1 && this.companies().length >= max) {
      this.planLimitModalService.open({
        title: 'Límite de Empresas Alcanzado',
        message: `Has alcanzado el límite de ${max} empresa(s) permitidas en tu plan ${this.subscriptionState.currentPlan()}.`,
        targetPlan: this.subscriptionState.currentPlan() === SubscriptionPlan.BASIC ? SubscriptionPlan.PRO : SubscriptionPlan.ENTERPRISE,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    this.isAddCompanySubmitted.set(false);
    this.companyErrorMessage.set(null);
    this.addCompanyForm.reset({
      name: '',
      amountStep: 100,
      pointsPerStep: 10,
      isPointsExpirationEnabled: false,
      pointsExpirationDays: null,
      isInactiveClientPurgeEnabled: false,
      inactiveClientPurgeDays: null,
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
      isPointsExpirationEnabled: !!val.isPointsExpirationEnabled,
      pointsExpirationDays: val.isPointsExpirationEnabled ? Number(val.pointsExpirationDays) : null,
      isInactiveClientPurgeEnabled: !!val.isInactiveClientPurgeEnabled,
      inactiveClientPurgeDays: val.isInactiveClientPurgeEnabled ? Number(val.inactiveClientPurgeDays) : null,
      companyDetails: {
        address: val.address!,
        city: val.city!,
        province: val.province!,
        country: val.country!,
        zipCode: val.zipCode!
      }
    };

    this.isCompanyLoading.set(true);
    this.companyErrorMessage.set(null);

    this.companyService.addCompany(dto).subscribe({
      next: (newComp) => {
        this.isCompanyLoading.set(false);
        this.closeAddCompanyModal();
        this.showToast(`¡Empresa "${newComp.name}" creada con éxito!`);
        this.loadCompanies();
      },
      error: (err) => {
        this.isCompanyLoading.set(false);
        this.companyErrorMessage.set(err.error?.message || 'Error al crear la empresa.');
      }
    });
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 4000);
  }
}
