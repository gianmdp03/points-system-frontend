import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../core/services/company-service';
import { AuthService } from '../../core/services/auth-service';
import { CompanyDetailDTO, Role } from '../../core/models';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-detail-page.html',
  styleUrl: './company-detail-page.css'
})
export class CompanyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly companyService = inject(CompanyService);
  protected readonly authService = inject(AuthService);

  readonly company = signal<CompanyDetailDTO | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'products' | 'promotions' | 'rewards' | 'sales'>('overview');

  // Modales visuales (sin lógica de submit)
  readonly showEditCompanyModal = signal<boolean>(false);
  readonly showAddProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly showAddPromotionModal = signal<boolean>(false);
  readonly showEditPromotionModal = signal<boolean>(false);
  readonly showAddRewardModal = signal<boolean>(false);
  readonly showEditRewardModal = signal<boolean>(false);
  readonly showAddSaleModal = signal<boolean>(false);
  readonly showEditSaleModal = signal<boolean>(false);

  openEditCompanyModal(): void { this.showEditCompanyModal.set(true); }
  closeEditCompanyModal(): void { this.showEditCompanyModal.set(false); }

  openAddProductModal(): void { this.showAddProductModal.set(true); }
  closeAddProductModal(): void { this.showAddProductModal.set(false); }
  openEditProductModal(): void { this.showEditProductModal.set(true); }
  closeEditProductModal(): void { this.showEditProductModal.set(false); }

  openAddPromotionModal(): void { this.showAddPromotionModal.set(true); }
  closeAddPromotionModal(): void { this.showAddPromotionModal.set(false); }
  openEditPromotionModal(): void { this.showEditPromotionModal.set(true); }
  closeEditPromotionModal(): void { this.showEditPromotionModal.set(false); }

  openAddRewardModal(): void { this.showAddRewardModal.set(true); }
  closeAddRewardModal(): void { this.showAddRewardModal.set(false); }
  openEditRewardModal(): void { this.showEditRewardModal.set(true); }
  closeEditRewardModal(): void { this.showEditRewardModal.set(false); }

  openAddSaleModal(): void { this.showAddSaleModal.set(true); }
  closeAddSaleModal(): void { this.showAddSaleModal.set(false); }
  openEditSaleModal(): void { this.showEditSaleModal.set(true); }
  closeEditSaleModal(): void { this.showEditSaleModal.set(false); }

  readonly currentRole = this.authService.currentRole;
  readonly RoleEnum = Role;

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

  setTab(tab: 'overview' | 'products' | 'promotions' | 'rewards' | 'sales'): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  //FORMULARIOS
  
}
