import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationType } from '../../../../../core/models';
import { isFieldInvalid, getFieldError } from '../../../../../core/utils/form-utils';

@Component({
  selector: 'app-message-template-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './message-template-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageTemplateModalComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isEdit: boolean = false;
  @Input() isSubmitted: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  readonly notificationTypes: { value: NotificationType; label: string; icon: string }[] = [
    { value: NotificationType.WELCOME_NOTIFICATION, label: 'WELCOME_NOTIFICATION (Bienvenida)', icon: '🚀' },
    { value: NotificationType.ALMOST_THERE_NOTIFICATION, label: 'ALMOST_THERE_NOTIFICATION (Cerca de tu beneficio)', icon: '🎯' },
    { value: NotificationType.CLIENT_RETENTION_NOTIFICATION, label: 'CLIENT_RETENTION_NOTIFICATION (Retención de cliente)', icon: '⏰' },
    { value: NotificationType.POINTS_EXPIRATION_NOTIFICATION, label: 'POINTS_EXPIRATION_NOTIFICATION (Aviso puntos por vencer)', icon: '⏳' },
    { value: NotificationType.PROMOTION_NOTIFICATION, label: 'PROMOTION_NOTIFICATION (Nuevas promociones)', icon: '🔥' },
    { value: NotificationType.CUSTOM_NOTIFICATION, label: 'CUSTOM_NOTIFICATION (Personalizada)', icon: '💬' }
  ];

  readonly availableVariables = [
    { token: '{nombre}', label: 'Nombre del Cliente' },
    { token: '{empresa}', label: 'Nombre de la Empresa' },
    { token: '{local}', label: 'Nombre del Local' },
    { token: '{puntos}', label: 'Saldo de Puntos' },
    { token: '{puntos_faltantes}', label: 'Puntos Faltantes' },
    { token: '{dias}', label: 'Días Restantes / Inactivos' }
  ];

  insertVariable(token: string): void {
    const current = this.form.get('content')?.value || '';
    this.form.patchValue({ content: current + ' ' + token });
  }

  get simulatedPreview(): string {
    const raw = this.form.get('content')?.value || '';
    if (!raw) return 'Escribe el contenido de la plantilla para ver la vista previa aquí...';

    return raw
      .replace(/\{nombre\}/g, 'María')
      .replace(/\{empresa\}/g, 'Café Martínez')
      .replace(/\{local\}/g, 'Café Martínez')
      .replace(/\{puntos\}/g, '450')
      .replace(/\{puntos_faltantes\}/g, '50')
      .replace(/\{dias\}/g, '7');
  }
}