import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { ProductService } from '../../core/services/product-service';
import { PromotionService } from '../../core/services/promotion-service';
import { RewardService } from '../../core/services/reward-service';
import { SaleService } from '../../core/services/sale-service';
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
  SaleRequestDTO
} from '../../core/models';

import { CompanyDetailHeaderComponent } from './components/company-detail-header/company-detail-header';
import { CompanyDetailTabsNavComponent, CompanyDetailTab } from './components/company-detail-tabs-nav/company-detail-tabs-nav';
import { TabOverviewComponent } from './components/tab-overview/tab-overview';
import { TabProductsComponent } from './components/tab-products/tab-products';
import { TabPromotionsComponent } from './components/tab-promotions/tab-promotions';
import { TabRewardsComponent } from './components/tab-rewards/tab-rewards';
import { TabSalesComponent } from './components/tab-sales/tab-sales';
import { EditCompanyModalComponent } from './components/modals/edit-company-modal/edit-company-modal';
import { ProductModalComponent } from './components/modals/product-modal/product-modal';
import { PromotionModalComponent } from './components/modals/promotion-modal/promotion-modal';
import { RewardModalComponent } from './components/modals/reward-modal/reward-modal';
import { SaleModalComponent } from './components/modals/sale-modal/sale-modal';

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
    EditCompanyModalComponent,
    ProductModalComponent,
    PromotionModalComponent,
    RewardModalComponent,
    SaleModalComponent
  ],
  templateUrl: './company-detail-page.html',
  styleUrl: './company-detail-page.css'
})
export class CompanyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly companyService = inject(CompanyService);
  protected readonly authService = inject(AuthService);
  protected readonly productService = inject(ProductService);
  protected readonly promotionService = inject(PromotionService);
  protected readonly rewardService = inject(RewardService);
  protected readonly saleService = inject(SaleService);

  readonly RoleEnum = Role;

  readonly company = signal<CompanyDetailDTO | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly modalErrorMessage = signal<string | null>(null);
  readonly activeTab = signal<CompanyDetailTab>('overview');

  // Visibilidad de Modales
  readonly showEditCompanyModal = signal<boolean>(false);
  readonly showAddProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly showAddPromotionModal = signal<boolean>(false);
  readonly showEditPromotionModal = signal<boolean>(false);
  readonly showAddRewardModal = signal<boolean>(false);
  readonly showEditRewardModal = signal<boolean>(false);
  readonly showAddSaleModal = signal<boolean>(false);
  readonly showEditSaleModal = signal<boolean>(false);

  // Flags de submit de formularios
  readonly isEditCompanySubmitted = signal<boolean>(false);
  readonly isAddProductSubmitted = signal<boolean>(false);
  readonly isEditProductSubmitted = signal<boolean>(false);
  readonly isAddPromotionSubmitted = signal<boolean>(false);
  readonly isEditPromotionSubmitted = signal<boolean>(false);
  readonly isAddRewardSubmitted = signal<boolean>(false);
  readonly isEditRewardSubmitted = signal<boolean>(false);
  readonly isAddSaleSubmitted = signal<boolean>(false);
  readonly isEditSaleSubmitted = signal<boolean>(false);

  selectedProductForEdit = signal<ProductListDTO | null>(null);
  selectedPromotionForEdit = signal<PromotionListDTO | null>(null);
  selectedRewardForEdit = signal<RewardListDTO | null>(null);
  selectedSaleForEdit = signal<SaleListDTO | null>(null);

  // FormGroups Reactivos
  editCompanyForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(300)]],
    amountStep: [100, [Validators.required, Validators.min(1)]],
    pointsPerStep: [10, [Validators.required, Validators.min(1)]],
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
    userDni: ['', [Validators.required]],
    amount: [1000, [Validators.required, Validators.min(1)]]
  });

  editSaleForm = this.fb.group({
    id: [0, [Validators.required]],
    userDni: ['', [Validators.required]],
    amount: [1000, [Validators.required, Validators.min(1)]]
  });

  readonly currentRole = this.authService.currentRole;

  readonly userPointsBalance = computed<number | null>(() => {
    if (this.currentRole() !== Role.USER) {
      return null;
    }
    const comp = this.company();
    const currentUserId = this.authService.userId();
    if (!comp || !comp.pointsAccounts || comp.pointsAccounts.length === 0) {
      return 0;
    }
    const myAccount = comp.pointsAccounts.find(pa => pa.user?.id === currentUserId) || comp.pointsAccounts[0];
    return myAccount ? myAccount.balance : 0;
  });

  ngOnInit(): void {
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

  setTab(tab: CompanyDetailTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // MODALES OPEN / CLOSE & POPULATE
  openEditCompanyModal(): void {
    const comp = this.company();
    if (comp) {
      this.editCompanyForm.patchValue({
        name: comp.name,
        amountStep: comp.amountStep,
        pointsPerStep: comp.pointsPerStep,
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
    this.addSaleForm.reset({ userDni: '', amount: 1000 });
    this.modalErrorMessage.set(null);
    this.isAddSaleSubmitted.set(false);
    this.showAddSaleModal.set(true);
  }
  closeAddSaleModal(): void { this.showAddSaleModal.set(false); }

  openEditSaleModal(sale?: SaleListDTO): void {
    if (sale) {
      this.selectedSaleForEdit.set(sale);
      this.editSaleForm.patchValue({
        id: sale.id,
        userDni: '',
        amount: sale.amount
      });
    }
    this.modalErrorMessage.set(null);
    this.isEditSaleSubmitted.set(false);
    this.showEditSaleModal.set(true);
  }
  closeEditSaleModal(): void { this.showEditSaleModal.set(false); }

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
      userDni: val.userDni!
    };
    this.modalErrorMessage.set(null);
    this.saleService.addSale(dto).subscribe({
      next: () => {
        this.closeAddSaleModal();
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => this.modalErrorMessage.set(err.error?.message || 'Error al registrar la venta.')
    });
  }

  onRedeemReward(rewardId: number): void {
    if (!this.company()) return;
    const userDni = prompt('Ingresa el DNI del cliente para canjear la recompensa:');
    if (!userDni) return;

    this.rewardService.redeemReward({
      companyId: this.company()!.id,
      rewardId,
      userDni
    }).subscribe({
      next: () => {
        alert('¡Premio canjeado con éxito!');
        this.fetchCompanyDetails(this.company()!.id);
      },
      error: (err) => alert('Error al canjear premio: ' + (err.error?.message || err.message))
    });
  }
}
