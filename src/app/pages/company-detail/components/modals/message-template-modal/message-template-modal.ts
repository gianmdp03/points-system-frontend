import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  NotificationType,
  NOTIFICATION_TYPE_CONFIG,
  NotificationTypeMetadata,
  NotificationVariable
} from '../../../../../core/models';
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
  @Input() companyName: string = 'Mi Comercio';

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  @ViewChild('contentTextarea') contentTextarea?: ElementRef<HTMLTextAreaElement>;

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;
  readonly typeConfigs = NOTIFICATION_TYPE_CONFIG;

  readonly notificationTypes: { value: NotificationType; label: string; icon: string; description: string }[] = [
    {
      value: NotificationType.WELCOME_NOTIFICATION,
      label: 'Aviso de Bienvenida',
      icon: '🚀',
      description: 'Envío automático al registrarse un nuevo cliente.'
    },
    {
      value: NotificationType.ALMOST_THERE_NOTIFICATION,
      label: 'Cerca del Premio',
      icon: '🎯',
      description: 'Notifica al cliente cuando está a pocos puntos de un premio.'
    },
    {
      value: NotificationType.CLIENT_RETENTION_NOTIFICATION,
      label: 'Retención de Clientes',
      icon: '⏰',
      description: 'Invita a volver a clientes inactivos recordando sus puntos.'
    },
    {
      value: NotificationType.POINTS_EXPIRATION_NOTIFICATION,
      label: 'Puntos por Vencer',
      icon: '⏳',
      description: 'Aviso urgente de vencimiento próximo de puntos.'
    },
    {
      value: NotificationType.PROMOTION_NOTIFICATION,
      label: 'Promociones Activas',
      icon: '🔥',
      description: 'Anuncio de promociones o multiplicadores vigentes.'
    },
    {
      value: NotificationType.CUSTOM_NOTIFICATION,
      label: 'Mensaje Personalizado',
      icon: '💬',
      description: 'Mensajes personalizados generales para cualquier fin.'
    }
  ];

  get currentSelectedType(): NotificationType {
    return this.form.get('type')?.value || NotificationType.WELCOME_NOTIFICATION;
  }

  get currentMetadata(): NotificationTypeMetadata {
    return this.typeConfigs[this.currentSelectedType] || this.typeConfigs[NotificationType.CUSTOM_NOTIFICATION];
  }

  get availableVariables(): NotificationVariable[] {
    return this.currentMetadata?.availableVariables || [];
  }

  insertVariable(token: string): void {
    const textarea = this.contentTextarea?.nativeElement;
    const currentVal = this.form.get('content')?.value || '';

    if (textarea) {
      const start = textarea.selectionStart ?? currentVal.length;
      const end = textarea.selectionEnd ?? currentVal.length;
      const before = currentVal.substring(0, start);
      const after = currentVal.substring(end);
      const newVal = before + token + after;

      this.form.patchValue({ content: newVal });
      this.form.get('content')?.markAsDirty();

      setTimeout(() => {
        textarea.focus();
        const newCursor = start + token.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    } else {
      const newVal = currentVal ? currentVal + ' ' + token : token;
      this.form.patchValue({ content: newVal });
      this.form.get('content')?.markAsDirty();
    }
  }

  get simulatedSubjectPreview(): string {
    const raw = this.form.get('subject')?.value || '';
    if (!raw) return 'Asunto del correo automático...';
    return this.applyReplacements(raw);
  }

  get simulatedContentPreview(): string {
    const raw = this.form.get('content')?.value || '';
    if (!raw) return 'Escribe el contenido de la plantilla arriba para ver la vista previa en tiempo real...';
    return this.applyReplacements(raw);
  }

  get contentLength(): number {
    return (this.form.get('content')?.value || '').length;
  }

  get subjectLength(): number {
    return (this.form.get('subject')?.value || '').length;
  }

  private applyReplacements(text: string): string {
    const comp = this.companyName || 'Café Martínez';
    return text
      .replace(/\{nombre\}/g, 'María')
      .replace(/\{empresa\}/g, comp)
      .replace(/\{local\}/g, comp + ' Centro')
      .replace(/\{puntos\}/g, '450')
      .replace(/\{puntos_faltantes\}/g, '50')
      .replace(/\{dias\}/g, '7');
  }
}
