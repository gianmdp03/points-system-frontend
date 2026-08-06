import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, min, FormField } from '@angular/forms/signals';
import { CompanyService } from '../../core/services/company-service';
import { ProductService } from '../../core/services/product-service';
import { PromotionService } from '../../core/services/promotion-service';
import { RewardService } from '../../core/services/reward-service';
import { AuthService } from '../../core/services/auth-service';
import {
  CompanyDetailDTO,
  CompanyUpdateDTO,
  ProductListDTO,
  ProductRequestDTO,
  ProductUpdateDTO,
  PromotionListDTO,
  PromotionRequestDTO,
  PromotionUpdateDTO,
  RewardListDTO,
  RewardRequestDTO,
  RewardUpdateDTO,
  Role
} from '../../core/models';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './company-detail-page.html',
  styleUrl: './company-detail-page.css'
})
export class CompanyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly companyService = inject(CompanyService);
  protected readonly productService = inject(ProductService);
  protected readonly promotionService = inject(PromotionService);
  protected readonly rewardService = inject(RewardService);
  protected readonly authService = inject(AuthService);

  readonly company = signal<CompanyDetailDTO | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'products' | 'promotions' | 'rewards'>('overview');

  readonly currentRole = this.authService.currentRole;
  readonly RoleEnum = Role;

  readonly canManage = computed(() => {
    const role = this.currentRole();
    return role === Role.COMPANY_ADMIN || role === Role.APP_ADMIN;
  });

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

  // Modal State: Editar Empresa
  readonly isEditCompanyModalOpen = signal<boolean>(false);
  readonly editCompanyLoading = signal<boolean>(false);
  readonly editCompanyError = signal<string | null>(null);
  readonly editCompanyModel = signal({
    name: '',
    address: '',
    city: '',
    province: '',
    country: '',
    zipCode: '',
    amountStep: 100,
    pointsPerStep: 10
  });
  readonly editCompanyForm = form(this.editCompanyModel, (f) => {
    required(f.name);
    required(f.amountStep);
    min(f.amountStep, 1);
    required(f.pointsPerStep);
    min(f.pointsPerStep, 1);
  });

  // Modal State: Producto
  readonly isProductModalOpen = signal<boolean>(false);
  readonly editingProductId = signal<number | null>(null);
  readonly productLoading = signal<boolean>(false);
  readonly productError = signal<string | null>(null);
  readonly productModel = signal({
    name: '',
    description: '',
    price: 0,
    image: ''
  });
  readonly productForm = form(this.productModel, (f) => {
    required(f.name);
    required(f.price);
    min(f.price, 0);
  });

  // Modal State: Promoción
  readonly isPromotionModalOpen = signal<boolean>(false);
  readonly editingPromotionId = signal<number | null>(null);
  readonly promotionLoading = signal<boolean>(false);
  readonly promotionError = signal<string | null>(null);
  readonly promotionModel = signal({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    multiplier: 1
  });
  readonly promotionForm = form(this.promotionModel, (f) => {
    required(f.name);
    required(f.startDate);
    required(f.endDate);
    required(f.multiplier);
    min(f.multiplier, 1);
  });

  // Modal State: Premio / Recompensa
  readonly isRewardModalOpen = signal<boolean>(false);
  readonly editingRewardId = signal<number | null>(null);
  readonly rewardLoading = signal<boolean>(false);
  readonly rewardError = signal<string | null>(null);
  readonly rewardModel = signal({
    name: '',
    description: '',
    costInPoints: 100
  });
  readonly rewardForm = form(this.rewardModel, (f) => {
    required(f.name);
    required(f.costInPoints);
    min(f.costInPoints, 1);
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

  setTab(tab: 'overview' | 'products' | 'promotions' | 'rewards'): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // ================= EDITAR EMPRESA =================
  openEditCompanyModal(): void {
    const comp = this.company();
    if (!comp) return;

    this.editCompanyModel.set({
      name: comp.name || '',
      address: comp.companyDetails?.address || '',
      city: comp.companyDetails?.city || '',
      province: comp.companyDetails?.province || '',
      country: comp.companyDetails?.country || '',
      zipCode: comp.companyDetails?.zipCode || '',
      amountStep: comp.amountStep || 100,
      pointsPerStep: comp.pointsPerStep || 10
    });
    this.editCompanyError.set(null);
    this.isEditCompanyModalOpen.set(true);
  }

  closeEditCompanyModal(): void {
    this.isEditCompanyModalOpen.set(false);
    this.editCompanyError.set(null);
  }

  submitUpdateCompany(): void {
    const comp = this.company();
    if (!comp) return;

    if (this.editCompanyForm().invalid()) {
      this.editCompanyError.set('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    const val = this.editCompanyModel();
    const dto: CompanyUpdateDTO = {
      name: val.name.trim(),
      companyDetails: {
        address: val.address.trim(),
        city: val.city.trim(),
        province: val.province.trim(),
        country: val.country.trim(),
        zipCode: val.zipCode.trim()
      },
      amountStep: Number(val.amountStep) || 1,
      pointsPerStep: Number(val.pointsPerStep) || 1
    };

    this.editCompanyLoading.set(true);
    this.editCompanyError.set(null);

    this.companyService.updateCompany(comp.id, dto).subscribe({
      next: () => {
        this.editCompanyLoading.set(false);
        this.closeEditCompanyModal();
        this.fetchCompanyDetails(comp.id);
      },
      error: (err) => {
        this.editCompanyLoading.set(false);
        this.editCompanyError.set(err.error?.message || err.message || 'Error al actualizar la empresa.');
      }
    });
  }

  // ================= PRODUCTOS =================
  openCreateProductModal(): void {
    this.editingProductId.set(null);
    this.productModel.set({
      name: '',
      description: '',
      price: 0,
      image: ''
    });
    this.productError.set(null);
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(prod: ProductListDTO): void {
    this.editingProductId.set(prod.id);
    this.productModel.set({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || 0,
      image: prod.image || ''
    });
    this.productError.set(null);
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
    this.productError.set(null);
  }

  submitProduct(): void {
    const comp = this.company();
    if (!comp) return;

    if (this.productForm().invalid()) {
      this.productError.set('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const val = this.productModel();
    const name = val.name.trim();
    const price = Number(val.price) || 0;
    const description = val.description.trim();
    const image = val.image.trim();

    this.productLoading.set(true);
    this.productError.set(null);

    const prodId = this.editingProductId();
    if (prodId === null) {
      const reqDto: ProductRequestDTO = {
        companyId: comp.id,
        name,
        description,
        price,
        image
      };
      this.productService.addProduct(reqDto).subscribe({
        next: () => {
          this.productLoading.set(false);
          this.closeProductModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.productLoading.set(false);
          this.productError.set(err.error?.message || err.message || 'Error al agregar el producto.');
        }
      });
    } else {
      const updateDto: ProductUpdateDTO = {
        name,
        description,
        price,
        image
      };
      this.productService.updateProduct(comp.id, prodId, updateDto).subscribe({
        next: () => {
          this.productLoading.set(false);
          this.closeProductModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.productLoading.set(false);
          this.productError.set(err.error?.message || err.message || 'Error al actualizar el producto.');
        }
      });
    }
  }

  deleteProduct(prod: ProductListDTO): void {
    const comp = this.company();
    if (!comp) return;

    if (confirm(`¿Estás seguro de eliminar el producto "${prod.name}"?`)) {
      this.productService.deleteProduct(comp.id, prod.id).subscribe({
        next: () => this.fetchCompanyDetails(comp.id),
        error: (err) => alert('Error al eliminar producto: ' + (err.error?.message || err.message))
      });
    }
  }

  // ================= PROMOCIONES =================
  openCreatePromotionModal(): void {
    this.editingPromotionId.set(null);
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const future = futureDate.toISOString().split('T')[0];

    this.promotionModel.set({
      name: '',
      description: '',
      startDate: today,
      endDate: future,
      multiplier: 2
    });
    this.promotionError.set(null);
    this.isPromotionModalOpen.set(true);
  }

  openEditPromotionModal(promo: PromotionListDTO): void {
    this.editingPromotionId.set(promo.id);
    this.promotionModel.set({
      name: promo.name || '',
      description: promo.description || '',
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
      multiplier: promo.multiplier || 1
    });
    this.promotionError.set(null);
    this.isPromotionModalOpen.set(true);
  }

  closePromotionModal(): void {
    this.isPromotionModalOpen.set(false);
    this.promotionError.set(null);
  }

  submitPromotion(): void {
    const comp = this.company();
    if (!comp) return;

    if (this.promotionForm().invalid()) {
      this.promotionError.set('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const val = this.promotionModel();
    const name = val.name.trim();
    const description = val.description.trim();
    const startDate = val.startDate;
    const endDate = val.endDate;
    const multiplier = Number(val.multiplier) || 1;

    this.promotionLoading.set(true);
    this.promotionError.set(null);

    const promoId = this.editingPromotionId();
    if (promoId === null) {
      const reqDto: PromotionRequestDTO = {
        companyId: comp.id,
        name,
        description,
        startDate,
        endDate,
        multiplier
      };
      this.promotionService.addPromotion(reqDto).subscribe({
        next: () => {
          this.promotionLoading.set(false);
          this.closePromotionModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.promotionLoading.set(false);
          this.promotionError.set(err.error?.message || err.message || 'Error al agregar la promoción.');
        }
      });
    } else {
      const updateDto: PromotionUpdateDTO = {
        name,
        description,
        startDate,
        endDate,
        multiplier
      };
      this.promotionService.updatePromotion(comp.id, promoId, updateDto).subscribe({
        next: () => {
          this.promotionLoading.set(false);
          this.closePromotionModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.promotionLoading.set(false);
          this.promotionError.set(err.error?.message || err.message || 'Error al actualizar la promoción.');
        }
      });
    }
  }

  togglePromotion(promo: PromotionListDTO): void {
    const comp = this.company();
    if (!comp) return;

    this.promotionService.enabledOrDisabled(comp.id, promo.id).subscribe({
      next: () => this.fetchCompanyDetails(comp.id),
      error: (err) => alert('Error al cambiar estado de la promoción: ' + (err.error?.message || err.message))
    });
  }

  // ================= PREMIOS / RECOMPENSAS =================
  openCreateRewardModal(): void {
    this.editingRewardId.set(null);
    this.rewardModel.set({
      name: '',
      description: '',
      costInPoints: 100
    });
    this.rewardError.set(null);
    this.isRewardModalOpen.set(true);
  }

  openEditRewardModal(reward: RewardListDTO): void {
    this.editingRewardId.set(reward.id);
    this.rewardModel.set({
      name: reward.name || '',
      description: reward.description || '',
      costInPoints: reward.costInPoints || 100
    });
    this.rewardError.set(null);
    this.isRewardModalOpen.set(true);
  }

  closeRewardModal(): void {
    this.isRewardModalOpen.set(false);
    this.rewardError.set(null);
  }

  submitReward(): void {
    const comp = this.company();
    if (!comp) return;

    if (this.rewardForm().invalid()) {
      this.rewardError.set('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const val = this.rewardModel();
    const name = val.name.trim();
    const description = val.description.trim();
    const costInPoints = Number(val.costInPoints) || 1;

    this.rewardLoading.set(true);
    this.rewardError.set(null);

    const rewardId = this.editingRewardId();
    if (rewardId === null) {
      const reqDto: RewardRequestDTO = {
        companyId: comp.id,
        name,
        description,
        costInPoints
      };
      this.rewardService.addReward(reqDto).subscribe({
        next: () => {
          this.rewardLoading.set(false);
          this.closeRewardModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.rewardLoading.set(false);
          this.rewardError.set(err.error?.message || err.message || 'Error al agregar el premio.');
        }
      });
    } else {
      const updateDto: RewardUpdateDTO = {
        name,
        description,
        pointsToEarn: costInPoints
      };
      this.rewardService.updateReward(comp.id, rewardId, updateDto).subscribe({
        next: () => {
          this.rewardLoading.set(false);
          this.closeRewardModal();
          this.fetchCompanyDetails(comp.id);
        },
        error: (err) => {
          this.rewardLoading.set(false);
          this.rewardError.set(err.error?.message || err.message || 'Error al actualizar el premio.');
        }
      });
    }
  }

  toggleReward(reward: RewardListDTO): void {
    const comp = this.company();
    if (!comp) return;

    this.rewardService.enableOrDisableReward(comp.id, reward.id).subscribe({
      next: () => this.fetchCompanyDetails(comp.id),
      error: (err) => alert('Error al cambiar estado del premio: ' + (err.error?.message || err.message))
    });
  }
}
