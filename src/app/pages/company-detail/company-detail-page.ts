import { Component, OnInit, inject, signal, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { ProductService } from '../../core/services/product-service';
import { PromotionService } from '../../core/services/promotion-service';
import { RewardService } from '../../core/services/reward-service';
import { SaleService } from '../../core/services/sale-service';
import { PointsAccountService } from '../../core/services/points-account-service';
import { MessageTemplateService } from '../../core/services/message-template-service';
import { PlanLimitModalService } from '../../core/services/plan-limit-modal-service';
import {
  CompanyDetailDTO,
  Role,
  ProductListDTO,
  PromotionListDTO,
  RewardListDTO,
  SaleListDTO,
  CompanyUpdateDTO,
  ProductRequestDTO,
  ProductUpdateDTO,
  PromotionRequestDTO,
  PromotionUpdateDTO,
  RewardRequestDTO,
  RewardUpdateDTO,
  SaleRequestDTO,
  PointsAccountRequestDTO,
  PointsAccountDetailDTO,
  RewardRedeemDTO,
  MessageTemplateListDTO,
  MessageTemplateRequestDTO,
  MessageTemplateUpdateDTO,
  NotificationType
} from '../../core/models';

import { CompanyDetailHeaderComponent } from './components/company-detail-header/company-detail-header';
import { CompanyDetailTabsNavComponent, CompanyDetailTab } from './components/company-detail-tabs-nav/company-detail-tabs-nav';
import { TabOverviewComponent } from './components/tab-overview/tab-overview';
import { TabProductsComponent } from './components/tab-products/tab-products';
import { TabPromotionsComponent } from './components/tab-promotions/tab-promotions';
import { TabRewardsComponent } from './components/tab-rewards/tab-rewards';
import { TabSalesComponent } from './components/tab-sales/tab-sales';
import { TabInactiveClientsComponent } from './components/tab-inactive-clients/tab-inactive-clients';
import { TabMessageTemplatesComponent } from './components/tab-message-templates/tab-message-templates';
import { EditCompanyModalComponent } from './components/modals/edit-company-modal/edit-company-modal';
import { ProductModalComponent } from './components/modals/product-modal/product-modal';
import { PromotionModalComponent } from './components/modals/promotion-modal/promotion-modal';
import { RewardModalComponent } from './components/modals/reward-modal/reward-modal';
import { SaleModalComponent } from './components/modals/sale-modal/sale-modal';
import { ClientModalComponent } from './components/modals/client-modal/client-modal';
import { RedeemModalComponent } from './components/modals/redeem-modal/redeem-modal';
import { MessageTemplateModalComponent } from './components/modals/message-template-modal/message-template-modal';
import { WhatsappRetentionModalComponent } from './components/modals/whatsapp-retention-modal/whatsapp-retention-modal';
import { CheckPointsModalComponent } from '../../components/company-quick-actions/modals/check-points-modal/check-points-modal';
import { QrGeneratorComponent } from '../../components/qr-generator/qr-generator';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    CompanyDetailHeaderComponent,
    CompanyDetailTabsNavComponent,
    TabOverviewComponent,
    TabProductsComponent,
    TabPromotionsComponent,
    TabRewardsComponent,
    TabSalesComponent,
    TabInactiveClientsComponent,
    TabMessageTemplatesComponent,
    EditCompanyModalComponent,
    MessageTemplateModalComponent,
    WhatsappRetentionModalComponent,
    ProductModalComponent,
    PromotionModalComponent,
    RewardModalComponent,
    SaleModalComponent,
    ClientModalComponent,
    RedeemModalComponent,
    CheckPointsModalComponent,
    QrGeneratorComponent
  ],
  templateUrl: './company-detail-page.html',
  styleUrl: './company-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly companyService = inject(CompanyService);
  protected readonly authService = inject(AuthService);
  protected readonly productService = inject(ProductService);
  protected readonly promotionService = inject(PromotionService);
  protected readonly rewardService = inject(RewardService);
  protected readonly saleService = inject(SaleService);
  protected readonly pointsAccountService = inject(PointsAccountService);
  protected readonly messageTemplateService = inject(MessageTemplateService);
  protected readonly planLimitModalService = inject(PlanLimitModalService);

  readonly RoleEnum = Role;

  readonly company = signal<CompanyDetailDTO | null>(null);
  readonly sales = signal<SaleListDTO[]>([]);
  readonly inactiveClients = signal<PointsAccountDetailDTO[]>([]);
  readonly inactiveClientsTotal = signal<number>(0);
  readonly inactiveClientsTotalPages = signal<number>(1);
  readonly inactiveClientsPage = signal<number>(0);
  readonly inactiveClientsDays = signal<number>(30);
  readonly messageTemplates = signal<MessageTemplateListDTO[]>([]);
  readonly showWhatsappModal = signal<boolean>(false);
  readonly selectedInactiveAccountForWhatsapp = signal<PointsAccountDetailDTO | null>(null);
  readonly retentionTemplates = computed(() => this.messageTemplates().filter(t => t.type === NotificationType.CLIENT_RETENTION_NOTIFICATION && t.isEnabled));
  
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingSales = signal<boolean>(false);
  readonly isLoadingInactiveClients = signal<boolean>(false);
  readonly isLoadingTemplates = signal<boolean>(false);
  readonly isResettingTemplates = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly modalErrorMessage = signal<string | null>(null);
  readonly activeTab = signal<CompanyDetailTab>('overview');

  readonly showMessageTemplateModal = signal<boolean>(false);
  readonly isMessageTemplateEdit = signal<boolean>(false);
  readonly isMessageTemplateSubmitted = signal<boolean>(false);
  readonly selectedTemplateForEdit = signal<MessageTemplateListDTO | null>(null);

  // Visibilidad de Modales
  readonly showQrModal = signal<boolean>(false);
  readonly showEditCompanyModal = signal<boolean>(false);
  readonly showAddProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly showAddPromotionModal = signal<boolean>(false);
  readonly showEditPromotionModal = signal<boolean>(false);
  readonly showAddRewardModal = signal<boolean>(false);
  readonly showEditRewardModal = signal<boolean>(false);
  readonly showAddSaleModal = signal<boolean>(false);
  readonly showAddClientModal = signal<boolean>(false);
  readonly showRedeemModal = signal<boolean>(false);
  readonly showCheckPointsModal = signal<boolean>(false);

  // Flags de submit
  readonly isEditCompanySubmitted = signal<boolean>(false);
  readonly isAddProductSubmitted = signal<boolean>(false);
  readonly isEditProductSubmitted = signal<boolean>(false);
  readonly isAddPromotionSubmitted = signal<boolean>(false);
  readonly isEditPromotionSubmitted = signal<boolean>(false);
  readonly isAddRewardSubmitted = signal<boolean>(false);
  readonly isEditRewardSubmitted = signal<boolean>(false);
  readonly isAddSaleSubmitted = signal<boolean>(false);
  readonly isAddClientSubmitted = signal<boolean>(false);
  readonly isRedeemSubmitted = signal<boolean>(false);
  readonly isRedeemLoading = signal<boolean>(false);

  selectedProductForEdit = signal<ProductListDTO | null>(null);
  selectedPromotionForEdit = signal<PromotionListDTO | null>(null);
  selectedRewardForEdit = signal<RewardListDTO | null>(null);
  selectedRewardForRedeem = signal<RewardListDTO | null>(null);

  // FormGroups Reactivos
  addClientForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.email]],
    phone: [''],
    isNotificationEnabled: [true]
  });

  editCompanyForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(300)]],
    amountStep: [100, [Validators.required, Validators.min(1)]],
    pointsPerStep: [10, [Validators.required, Validators.min(1)]],
    isPointsExpirationEnabled: [false],
    pointsExpirationDays: [null as number | null],
    isInactiveClientPurgeEnabled: [false],
    inactiveClientPurgeDays: [null as number | null],
    isClientRetentionEnabled: [false],
    clientRetentionDays: [null as number | null],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    province: ['', [Validators.required]],
    country: ['Argentina', [Validators.required]],
    zipCode: ['', [Validators.required]]
  });

  addProductForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(1)]],
    image: ['', [Validators.maxLength(1000)]]
  });

  editProductForm = this.fb.group({
    id: [0, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(1)]],
    image: ['', [Validators.maxLength(1000)]]
  });

  addPromotionForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    multiplier: [2, [Validators.required, Validators.min(1)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]]
  });

  editPromotionForm = this.fb.group({
    id: [0, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    multiplier: [2, [Validators.required, Validators.min(1)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]]
  });

  addRewardForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    costInPoints: [100, [Validators.required, Validators.min(1)]]
  });

  editRewardForm = this.fb.group({
    id: [0, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    costInPoints: [100, [Validators.required, Validators.min(1)]]
  });

  addSaleForm = this.fb.group({
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    amount: [1000, [Validators.required, Validators.min(1)]]
  });

  redeemForm = this.fb.group({
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]]
  });

  messageTemplateForm = this.fb.group({
    id: [null as number | null],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    type: [NotificationType.WELCOME_NOTIFICATION, [Validators.required]],
    subject: ['', [Validators.maxLength(200)]],
    content: ['', [Validators.required, Validators.maxLength(4000)]]
  });

  readonly currentRole = this.authService.currentRole;

  private setupExpirationValidators(): void {
    this.editCompanyForm.get('isPointsExpirationEnabled')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((enabled: boolean | null) => {
      const daysControl = this.editCompanyForm.get('pointsExpirationDays');
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

    this.editCompanyForm.get('isInactiveClientPurgeEnabled')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((enabled: boolean | null) => {
      const daysControl = this.editCompanyForm.get('inactiveClientPurgeDays');
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

    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && ['overview', 'products', 'promotions', 'rewards', 'sales', 'inactive-clients', 'templates'].includes(tabParam)) {
      this.activeTab.set(tabParam as CompanyDetailTab);
    }
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['tab'] && ['overview', 'products', 'promotions', 'rewards', 'sales', 'inactive-clients', 'templates'].includes(params['tab'])) {
        this.activeTab.set(params['tab'] as CompanyDetailTab);
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const companyId = Number(idParam);
      if (!isNaN(companyId)) {
        this.fetchCompanyDetails(companyId);
      } else {
        this.errorMessage.set('Identificador de empresa no válido.');
        this.isLoading.set(false);
      }
    } else {
      this.errorMessage.set('No se especificó ninguna empresa.');
      this.isLoading.set(false);
    }
  }

  fetchCompanyDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.companyService.getCompanyById(id).subscribe({
      next: (data) => {
        this.company.set(data);
        this.isLoading.set(false);
        this.fetchCompanySales(id);
        this.fetchMessageTemplates(id);
        if (this.activeTab() === 'inactive-clients') {
          this.fetchInactiveClients(id);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.status === 404
          ? 'La empresa solicitada no existe o no fue encontrada.'
          : err.status === 401 || err.status === 403
            ? 'No tienes permisos para ver el detalle de esta empresa.'
            : (err.error?.message || 'Error al conectar con el servidor.');
        this.errorMessage.set(msg);
      }
    });
  }

  fetchCompanySales(id: number): void {
    this.isLoadingSales.set(true);
    this.saleService.listCompaniesSales(id).subscribe({
      next: (page) => {
        this.sales.set(page?.content || []);
        this.isLoadingSales.set(false);
      },
      error: () => {
        this.isLoadingSales.set(false);
      }
    });
  }

  fetchInactiveClients(companyId: number, days: number = this.inactiveClientsDays(), page: number = 0): void {
    this.isLoadingInactiveClients.set(true);
    this.inactiveClientsDays.set(days);
    this.inactiveClientsPage.set(page);
    this.pointsAccountService.listInactiveClients(companyId, days, page, 10).subscribe({
      next: (res) => {
        this.inactiveClients.set(res?.content || []);
        this.inactiveClientsTotal.set(res?.page?.totalElements ?? res?.totalElements ?? 0);
        this.inactiveClientsTotalPages.set(res?.page?.totalPages ?? res?.totalPages ?? 1);
        this.isLoadingInactiveClients.set(false);
      },
      error: () => {
        this.isLoadingInactiveClients.set(false);
      }
    });
  }

  onInactiveDaysChange(days: number): void {
    const comp = this.company();
    if (comp) {
      this.fetchInactiveClients(comp.id, days, 0);
    }
  }

  onInactivePageChange(page: number): void {
    const comp = this.company();
    if (comp) {
      this.fetchInactiveClients(comp.id, this.inactiveClientsDays(), page);
    }
  }

  openWhatsappRetentionModal(account: PointsAccountDetailDTO): void {
    this.selectedInactiveAccountForWhatsapp.set(account);
    this.showWhatsappModal.set(true);
  }

  closeWhatsappRetentionModal(): void {
    this.showWhatsappModal.set(false);
    this.selectedInactiveAccountForWhatsapp.set(null);
  }

  setTab(tab: CompanyDetailTab): void {
    this.activeTab.set(tab);
    if (tab === 'sales' && this.company()) {
      this.fetchCompanySales(this.company()!.id);
    } else if (tab === 'inactive-clients' && this.company()) {
      this.fetchInactiveClients(this.company()!.id);
    } else if (tab === 'templates' && this.company()) {
      this.fetchMessageTemplates(this.company()!.id);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // MODALES OPEN / CLOSE & POPULATE
  
  openQrModal(): void {
    this.showQrModal.set(true);
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
  }

  openEditCompanyModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    const comp = this.company();
    if (comp) {
      this.editCompanyForm.patchValue({
        name: comp.name,
        amountStep: comp.amountStep,
        pointsPerStep: comp.pointsPerStep,
        isPointsExpirationEnabled: comp.isPointsExpirationEnabled ?? false,
        pointsExpirationDays: comp.pointsExpirationDays ?? null,
        isInactiveClientPurgeEnabled: comp.isInactiveClientPurgeEnabled ?? false,
        inactiveClientPurgeDays: comp.inactiveClientPurgeDays ?? null,
        isClientRetentionEnabled: comp.isClientRetentionEnabled ?? false,
        clientRetentionDays: comp.clientRetentionDays ?? null,
        address: comp.companyDetails?.address || '',
        city: comp.companyDetails?.city || '',
        province: comp.companyDetails?.province || '',
        country: comp.companyDetails?.country || 'Argentina',
        zipCode: comp.companyDetails?.zipCode || ''
      });
    }
    this.modalErrorMessage.set(null);
    this.isEditCompanySubmitted.set(false);
    this.showEditCompanyModal.set(true);
  }
  closeEditCompanyModal(): void { this.showEditCompanyModal.set(false); }

  openAddProductModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.addProductForm.reset({ name: '', description: '', price: 0, image: '' });
    this.modalErrorMessage.set(null);
    this.isAddProductSubmitted.set(false);
    this.showAddProductModal.set(true);
  }
  closeAddProductModal(): void { this.showAddProductModal.set(false); }

  openEditProductModal(product?: ProductListDTO): void {
    const p = product || (this.company()?.products && this.company()?.products![0]);
    if (p) {
      this.selectedProductForEdit.set(p);
      this.editProductForm.patchValue({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        image: p.image || ''
      });
    }
    this.modalErrorMessage.set(null);
    this.isEditProductSubmitted.set(false);
    this.showEditProductModal.set(true);
  }
  closeEditProductModal(): void { this.showEditProductModal.set(false); }

  openAddPromotionModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.addPromotionForm.reset({ name: '', description: '', multiplier: 2, startDate: '', endDate: '' });
    this.modalErrorMessage.set(null);
    this.isAddPromotionSubmitted.set(false);
    this.showAddPromotionModal.set(true);
  }
  closeAddPromotionModal(): void { this.showAddPromotionModal.set(false); }

  openEditPromotionModal(promo?: PromotionListDTO): void {
    const pr = promo || (this.company()?.promotions && this.company()?.promotions![0]);
    if (pr) {
      this.selectedPromotionForEdit.set(pr);
      this.editPromotionForm.patchValue({
        id: pr.id,
        name: pr.name,
        description: pr.description || '',
        multiplier: pr.multiplier,
        startDate: pr.startDate ? pr.startDate.split('T')[0] : '',
        endDate: pr.endDate ? pr.endDate.split('T')[0] : ''
      });
    }
    this.modalErrorMessage.set(null);
    this.isEditPromotionSubmitted.set(false);
    this.showEditPromotionModal.set(true);
  }
  closeEditPromotionModal(): void { this.showEditPromotionModal.set(false); }

  openAddRewardModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.addRewardForm.reset({ name: '', description: '', costInPoints: 100 });
    this.modalErrorMessage.set(null);
    this.isAddRewardSubmitted.set(false);
    this.showAddRewardModal.set(true);
  }
  closeAddRewardModal(): void { this.showAddRewardModal.set(false); }

  openEditRewardModal(reward?: RewardListDTO): void {
    const r = reward || (this.company()?.rewards && this.company()?.rewards![0]);
    if (r) {
      this.selectedRewardForEdit.set(r);
      this.editRewardForm.patchValue({
        id: r.id,
        name: r.name,
        description: r.description || '',
        costInPoints: r.costInPoints
      });
    }
    this.modalErrorMessage.set(null);
    this.isEditRewardSubmitted.set(false);
    this.showEditRewardModal.set(true);
  }
  closeEditRewardModal(): void { this.showEditRewardModal.set(false); }

  openAddSaleModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.addSaleForm.reset({ country: 'Argentina', dni: '', amount: 1000 });
    this.modalErrorMessage.set(null);
    this.isAddSaleSubmitted.set(false);
    this.showAddSaleModal.set(true);
  }
  closeAddSaleModal(): void { this.showAddSaleModal.set(false); }

  openAddClientModal(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.addClientForm.reset({ name: '', country: 'Argentina', dni: '', email: '', phone: '', isNotificationEnabled: true });
    this.modalErrorMessage.set(null);
    this.isAddClientSubmitted.set(false);
    this.showAddClientModal.set(true);
  }
  closeAddClientModal(): void { this.showAddClientModal.set(false); }

  openRedeemModal(reward: RewardListDTO): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    this.selectedRewardForRedeem.set(reward);
    this.redeemForm.reset({ country: 'Argentina', dni: '' });
    this.modalErrorMessage.set(null);
    this.isRedeemSubmitted.set(false);
    this.isRedeemLoading.set(false);
    this.showRedeemModal.set(true);
  }
  closeRedeemModal(): void { this.showRedeemModal.set(false); }

  openCheckPointsModal(): void {
    this.showCheckPointsModal.set(true);
  }
  closeCheckPointsModal(): void {
    this.showCheckPointsModal.set(false);
  }
  onCheckPointsGoToSale(data: { dni: string; country: string }): void {
    this.closeCheckPointsModal();
    this.openAddSaleModal();
    this.addSaleForm.patchValue({ dni: data.dni, country: data.country });
  }

  onAddClientSubmit(): void {
    this.isAddClientSubmitted.set(true);
    if (this.addClientForm.invalid || !this.company()) {
      this.addClientForm.markAllAsTouched();
      return;
    }
    const val = this.addClientForm.getRawValue();
    const dto: PointsAccountRequestDTO = {
      companyId: this.company()!.id,
      name: val.name!,
      country: val.country!,
      dni: val.dni!,
      email: val.email || undefined,
      phone: val.phone || undefined,
      isNotificationEnabled: val.isNotificationEnabled !== undefined ? Boolean(val.isNotificationEnabled) : true
    };
    this.modalErrorMessage.set(null);
    this.pointsAccountService.registerClientAndCreateAccount(dto).subscribe({
      next: () => {
        this.closeAddClientModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al asociar el cliente.')
    });
  }

  // ACTIONS SUBMITS BACKEND
  onEditCompanySubmit(): void {
    this.isEditCompanySubmitted.set(true);
    if (this.editCompanyForm.invalid || !this.company()) {
      this.editCompanyForm.markAllAsTouched();
      return;
    }
    const val = this.editCompanyForm.getRawValue();
    const dto: CompanyUpdateDTO = {
      name: val.name!,
      amountStep: Number(val.amountStep),
      pointsPerStep: Number(val.pointsPerStep),
      isPointsExpirationEnabled: !!val.isPointsExpirationEnabled,
      pointsExpirationDays: val.isPointsExpirationEnabled ? Number(val.pointsExpirationDays) : null,
      isInactiveClientPurgeEnabled: !!val.isInactiveClientPurgeEnabled,
      inactiveClientPurgeDays: val.isInactiveClientPurgeEnabled ? Number(val.inactiveClientPurgeDays) : null,
      isClientRetentionEnabled: !!val.isClientRetentionEnabled,
      clientRetentionDays: val.isClientRetentionEnabled ? Number(val.clientRetentionDays) : null,
      companyDetails: {
        country: val.country!,
        province: val.province!,
        city: val.city!,
        address: val.address!,
        zipCode: val.zipCode!
      }
    };
    this.modalErrorMessage.set(null);
    this.companyService.updateCompany(this.company()!.id, dto).subscribe({
      next: () => {
        this.closeEditCompanyModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al actualizar la empresa.')
    });
  }

  onAddProductSubmit(): void {
    this.isAddProductSubmitted.set(true);
    if (this.addProductForm.invalid || !this.company()) {
      this.addProductForm.markAllAsTouched();
      return;
    }
    const val = this.addProductForm.getRawValue();
    const dto: ProductRequestDTO = {
      name: val.name!,
      description: val.description || '',
      price: Number(val.price),
      image: val.image || '',
      companyId: this.company()!.id
    };
    this.modalErrorMessage.set(null);
    this.productService.addProduct(dto).subscribe({
      next: () => {
        this.closeAddProductModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al agregar el producto.')
    });
  }

  onEditProductSubmit(): void {
    this.isEditProductSubmitted.set(true);
    if (this.editProductForm.invalid || !this.company()) {
      this.editProductForm.markAllAsTouched();
      return;
    }
    const val = this.editProductForm.getRawValue();
    const dto: ProductUpdateDTO = {
      name: val.name!,
      description: val.description || '',
      price: Number(val.price),
      image: val.image || ''
    };
    this.modalErrorMessage.set(null);
    this.productService.updateProduct(this.company()!.id, val.id!, dto).subscribe({
      next: () => {
        this.closeEditProductModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al actualizar el producto.')
    });
  }

  onDeleteProduct(productId: number): void {
    if (!this.company() || !confirm('¿Estás seguro de eliminar este producto?')) return;
    this.productService.deleteProduct(this.company()!.id, productId).subscribe({
      next: () => this.fetchCompanyDetails(this.company()!.id),
      error: (err) => alert('Error al eliminar producto: ' + (err.error?.message || err.message))
    });
  }

  onAddPromotionSubmit(): void {
    this.isAddPromotionSubmitted.set(true);
    if (this.addPromotionForm.invalid || !this.company()) {
      this.addPromotionForm.markAllAsTouched();
      return;
    }
    const val = this.addPromotionForm.getRawValue();
    const dto: PromotionRequestDTO = {
      name: val.name!,
      description: val.description || '',
      multiplier: Number(val.multiplier),
      startDate: new Date(val.startDate!).toISOString(),
      endDate: new Date(val.endDate!).toISOString(),
      companyId: this.company()!.id
    };
    this.modalErrorMessage.set(null);
    this.promotionService.addPromotion(dto).subscribe({
      next: () => {
        this.closeAddPromotionModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al agregar la promoción.')
    });
  }

  onEditPromotionSubmit(): void {
    this.isEditPromotionSubmitted.set(true);
    if (this.editPromotionForm.invalid || !this.company()) {
      this.editPromotionForm.markAllAsTouched();
      return;
    }
    const val = this.editPromotionForm.getRawValue();
    const dto: PromotionUpdateDTO = {
      name: val.name!,
      description: val.description || '',
      multiplier: Number(val.multiplier),
      startDate: new Date(val.startDate!).toISOString(),
      endDate: new Date(val.endDate!).toISOString()
    };
    this.modalErrorMessage.set(null);
    this.promotionService.updatePromotion(this.company()!.id, val.id!, dto).subscribe({
      next: () => {
        this.closeEditPromotionModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al actualizar la promoción.')
    });
  }

  onAddRewardSubmit(): void {
    this.isAddRewardSubmitted.set(true);
    if (this.addRewardForm.invalid || !this.company()) {
      this.addRewardForm.markAllAsTouched();
      return;
    }
    const val = this.addRewardForm.getRawValue();
    const dto: RewardRequestDTO = {
      name: val.name!,
      description: val.description || '',
      costInPoints: Number(val.costInPoints),
      companyId: this.company()!.id
    };
    this.modalErrorMessage.set(null);
    this.rewardService.addReward(dto).subscribe({
      next: () => {
        this.closeAddRewardModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al agregar la recompensa.')
    });
  }

  onEditRewardSubmit(): void {
    this.isEditRewardSubmitted.set(true);
    if (this.editRewardForm.invalid || !this.company()) {
      this.editRewardForm.markAllAsTouched();
      return;
    }
    const val = this.editRewardForm.getRawValue();
    const dto: RewardUpdateDTO = {
      name: val.name!,
      description: val.description || '',
      costInPoints: Number(val.costInPoints)
    };
    this.modalErrorMessage.set(null);
    this.rewardService.updateReward(this.company()!.id, val.id!, dto).subscribe({
      next: () => {
        this.closeEditRewardModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al actualizar el premio.')
    });
  }

  onAddSaleSubmit(): void {
    this.isAddSaleSubmitted.set(true);
    if (this.addSaleForm.invalid || !this.company()) {
      this.addSaleForm.markAllAsTouched();
      return;
    }
    const val = this.addSaleForm.getRawValue();
    const dto: SaleRequestDTO = {
      amount: Number(val.amount),
      companyId: this.company()!.id,
      dni: val.dni!,
      country: val.country!
    };
    this.modalErrorMessage.set(null);
    this.saleService.addSale(dto).subscribe({
      next: () => {
        this.closeAddSaleModal();
        const compId = this.company()!.id;
        this.fetchCompanySales(compId);
        this.fetchCompanyDetails(compId);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al registrar la venta.')
    });
  }

  onRedeemReward(reward: RewardListDTO): void {
    this.openRedeemModal(reward);
  }

  onRedeemSubmit(): void {
    this.isRedeemSubmitted.set(true);
    if (this.redeemForm.invalid || !this.company() || !this.selectedRewardForRedeem()) {
      this.redeemForm.markAllAsTouched();
      return;
    }
    const val = this.redeemForm.getRawValue();
    const dto: RewardRedeemDTO = {
      companyId: this.company()!.id,
      rewardId: this.selectedRewardForRedeem()!.id,
      dni: val.dni!,
      country: val.country!
    };
    this.isRedeemLoading.set(true);
    this.modalErrorMessage.set(null);
    this.rewardService.redeemReward(dto).subscribe({
      next: () => {
        this.isRedeemLoading.set(false);
        this.closeRedeemModal();
        alert('¡Recompensa canjeada con éxito!');
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => {
        this.isRedeemLoading.set(false);
        this.modalErrorMessage.set(err.error?.message || 'Error al canjear premio.');
      }
    });
  }

  // TEMPLATES MANAGEMENT METHODS
  fetchMessageTemplates(companyId: number): void {
    this.isLoadingTemplates.set(true);
    this.messageTemplateService.getAllByCompany(companyId).subscribe({
      next: (list) => {
        this.messageTemplates.set(list || []);
        this.isLoadingTemplates.set(false);
      },
      error: () => {
        this.isLoadingTemplates.set(false);
      }
    });
  }

  openAddMessageTemplateModal(preselectedType?: NotificationType): void {
    this.isMessageTemplateEdit.set(false);
    this.selectedTemplateForEdit.set(null);
    this.messageTemplateForm.reset({
      id: null,
      name: '',
      type: preselectedType || NotificationType.WELCOME_NOTIFICATION,
      subject: '',
      content: ''
    });
    this.isMessageTemplateSubmitted.set(false);
    this.modalErrorMessage.set(null);
    this.showMessageTemplateModal.set(true);
  }

  openEditMessageTemplateModal(tpl: MessageTemplateListDTO): void {
    this.isMessageTemplateEdit.set(true);
    this.selectedTemplateForEdit.set(tpl);
    this.messageTemplateForm.patchValue({
      id: tpl.id,
      name: tpl.name,
      type: tpl.type,
      subject: tpl.subject || '',
      content: tpl.content
    });
    this.isMessageTemplateSubmitted.set(false);
    this.modalErrorMessage.set(null);
    this.showMessageTemplateModal.set(true);
  }

  closeMessageTemplateModal(): void {
    this.showMessageTemplateModal.set(false);
    this.modalErrorMessage.set(null);
  }

  onMessageTemplateSubmit(): void {
    this.isMessageTemplateSubmitted.set(true);
    if (this.messageTemplateForm.invalid || !this.company()) {
      this.messageTemplateForm.markAllAsTouched();
      return;
    }
    const compId = this.company()!.id;
    const val = this.messageTemplateForm.getRawValue();

    if (this.isMessageTemplateEdit() && val.id) {
      const dto: MessageTemplateUpdateDTO = {
        name: val.name!,
        type: val.type!,
        subject: val.subject || '',
        content: val.content!
      };
      this.messageTemplateService.updateTemplate(compId, val.id, dto).subscribe({
        next: () => {
          this.closeMessageTemplateModal();
          this.fetchMessageTemplates(compId);
        },
        error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al actualizar plantilla.')
      });
    } else {
      const dto: MessageTemplateRequestDTO = {
        name: val.name!,
        type: val.type!,
        subject: val.subject || '',
        content: val.content!,
        companyId: compId
      };
      this.messageTemplateService.addTemplate(dto).subscribe({
        next: () => {
          this.closeMessageTemplateModal();
          this.fetchMessageTemplates(compId);
        },
        error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al crear plantilla.')
      });
    }
  }

  onToggleMessageTemplate(tpl: MessageTemplateListDTO): void {
    if (!this.company()) return;
    this.messageTemplateService.toggleTemplate(this.company()!.id, tpl.id).subscribe({
      next: () => {
        this.fetchMessageTemplates(this.company()!.id);
      },
      error: (err) => alert(err.error?.message || 'Error al modificar estado de la plantilla.')
    });
  }

  onDeleteMessageTemplate(tpl: MessageTemplateListDTO): void {
    if (!this.company() || !confirm(`¿Estás seguro de eliminar la variante "${tpl.name}"?`)) return;
    this.messageTemplateService.deleteTemplate(this.company()!.id, tpl.id).subscribe({
      next: () => {
        this.fetchMessageTemplates(this.company()!.id);
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar plantilla.')
    });
  }

  onResetDefaultTemplates(): void {
    if (!this.company()) return;
    const confirmReset = confirm('¿Deseas restaurar las 6 plantillas oficiales sugeridas por el sistema? Se reemplazarán las actuales.');
    if (!confirmReset) return;

    this.isResettingTemplates.set(true);
    this.messageTemplateService.resetDefaults(this.company()!.id).subscribe({
      next: () => {
        this.isResettingTemplates.set(false);
        this.fetchMessageTemplates(this.company()!.id);
      },
      error: (err) => {
        this.isResettingTemplates.set(false);
        alert(err.error?.message || 'Error al restaurar plantillas por defecto.');
      }
    });
  }

  onUpdateRetentionSettings(settings: { enabled: boolean; days: number }): void {
    const comp = this.company();
    if (!comp) return;

    const dto: CompanyUpdateDTO = {
      isClientRetentionEnabled: settings.enabled,
      clientRetentionDays: settings.enabled ? settings.days : null
    };

    this.companyService.updateCompany(comp.id, dto).subscribe({
      next: (updatedComp) => {
        this.company.set(updatedComp);
        alert(settings.enabled
          ? ('¡Retención automática activada! Se enviarán recordatorios cada ' + settings.days + ' días de inactividad.')
          : 'Retención automática de clientes pausada.');
      },
      error: (err) => {
        alert('Error al actualizar la configuración de retención: ' + (err.error?.message || err.message));
      }
    });
  }
}
