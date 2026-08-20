import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientPublicService } from '../../../../core/services/client-public-service';
import { CompanyListDTO, CompanyPublicDetailDTO } from '../../../../core/models';
import { CountrySelectComponent } from '../../../country-select/country-select';
import { isFieldInvalid, getFieldError } from '../../../../core/utils/form-utils';

@Component({
  selector: 'app-check-points-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountrySelectComponent],
  templateUrl: './check-points-modal.html'
})
export class CheckPointsModalComponent {
  @Input({ required: true }) company!: CompanyListDTO;
  @Output() close = new EventEmitter<void>();
  @Output() goToSale = new EventEmitter<{ dni: string; country: string }>();

  private readonly fb = new FormBuilder();
  private readonly clientPublicService: ClientPublicService;

  readonly isSubmitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchResult = signal<CompanyPublicDetailDTO | null>(null);

  readonly form: FormGroup;
  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  constructor(clientPublicService: ClientPublicService) {
    this.clientPublicService = clientPublicService;
    this.form = this.fb.group({
      country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
      dni: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    if (this.company?.companyDetails?.country) {
      this.form.patchValue({ country: this.company.companyDetails.country });
    }
  }

  onSubmit(): void {
    this.isSubmitted.set(true);
    this.errorMessage.set(null);
    this.searchResult.set(null);

    if (this.form.invalid || !this.company) {
      this.form.markAllAsTouched();
      return;
    }

    const { country, dni } = this.form.getRawValue();
    this.isLoading.set(true);

    this.clientPublicService.getCompanyPublicDetail(country, dni, this.company.id).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.searchResult.set(data);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.status === 404
          ? 'No se encontró ninguna cuenta de puntos asociada a este DNI en esta sucursal.'
          : (err.error?.message || 'Error al consultar los puntos del cliente.');
        this.errorMessage.set(msg);
      }
    });
  }

  resetSearch(): void {
    this.searchResult.set(null);
    this.errorMessage.set(null);
    this.isSubmitted.set(false);
    this.form.patchValue({ dni: '' });
  }

  onChargeSaleClick(): void {
    const res = this.searchResult();
    const { country, dni } = this.form.getRawValue();
    this.close.emit();
    this.goToSale.emit({ dni, country });
  }
}
