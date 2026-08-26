import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientPublicService } from '../../core/services/client-public-service';
import { CountryService } from '../../core/services/country-service';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-client-join',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-join.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientJoinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly clientPublicService = inject(ClientPublicService);
  protected readonly countryService = inject(CountryService);
  protected readonly configService = inject(AppConfigService);

  readonly companyId = signal<number | null>(null);
  readonly companyName = signal<string>('Cargando...');
  readonly isLoadingCompany = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);
  readonly registeredClientName = signal<string>('');
  readonly errorMessage = signal<string | null>(null);
  readonly isAlreadyRegistered = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    country: ['Argentina', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.email]],
    phone: [''],
    isNotificationEnabled: [true]
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('companyId');
      if (idParam && !isNaN(Number(idParam))) {
        const id = Number(idParam);
        this.companyId.set(id);
        this.loadCompanyName(id);
      } else {
        this.errorMessage.set('Enlace de registro inválido.');
        this.isLoadingCompany.set(false);
      }
    });
  }

  private loadCompanyName(id: number): void {
    this.isLoadingCompany.set(true);
    this.errorMessage.set(null);

    this.clientPublicService.getCompanyName(id).subscribe({
      next: (data) => {
        this.companyName.set(data.name);
        this.isLoadingCompany.set(false);
      },
      error: (err) => {
        this.isLoadingCompany.set(false);
        if (err.status === 404) {
          this.errorMessage.set('Este comercio no existe o se encuentra inactivo.');
        } else {
          this.errorMessage.set('No se pudo verificar la información del comercio.');
        }
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.companyId() || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.isAlreadyRegistered.set(false);

    const val = this.form.value;
    const payload = {
      companyId: this.companyId()!,
      dni: val.dni.trim(),
      country: val.country.trim(),
      name: val.name.trim(),
      email: val.email ? val.email.trim() : undefined,
      phone: val.phone ? val.phone.trim() : undefined,
      isNotificationEnabled: val.isNotificationEnabled !== undefined ? Boolean(val.isNotificationEnabled) : true
    };

    this.clientPublicService.joinCompany(payload).subscribe({
      next: (account) => {
        this.isSubmitting.set(false);
        this.registeredClientName.set(val.name.trim());
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          this.isAlreadyRegistered.set(true);
          this.errorMessage.set('¡Ya estás registrado en esta sucursal! Podés pedirle al cajero tus puntos indicando tu DNI.');
        } else if (err.error && typeof err.error.message === 'string') {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Ocurrió un error al procesar tu registro. Por favor, intentá nuevamente.');
        }
      }
    });
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio.';
      if (control.errors['email']) return 'Ingresa un formato de correo válido.';
      if (control.errors['minlength']) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      if (control.errors['maxlength']) return `No puede superar ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return null;
  }
}