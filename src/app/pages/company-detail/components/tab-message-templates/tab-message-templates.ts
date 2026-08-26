import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageTemplateListDTO, NotificationType, Role } from '../../../../core/models';

@Component({
  selector: 'app-tab-message-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-message-templates.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class TabMessageTemplatesComponent {
  @Input({ required: true }) templates: MessageTemplateListDTO[] = [];
  @Input() isLoading: boolean = false;
  @Input() currentRole: Role | null = null;
  @Input() isResettingDefaults: boolean = false;

  @Output() addTemplate = new EventEmitter<void>();
  @Output() editTemplate = new EventEmitter<MessageTemplateListDTO>();
  @Output() toggleTemplate = new EventEmitter<MessageTemplateListDTO>();
  @Output() resetDefaults = new EventEmitter<void>();

  readonly RoleEnum = Role;
  readonly NotificationTypeEnum = NotificationType;

  readonly selectedFilter = signal<string>('ALL');
  readonly previewedTemplateId = signal<number | null>(null);

  readonly filteredTemplates = computed(() => {
    const list = this.templates;
    const filter = this.selectedFilter();
    if (filter === 'ALL') return list;
    return list.filter(t => t.type === filter);
  });

  getTypeBadge(type: NotificationType): { label: string; icon: string; bg: string; text: string } {
    switch (type) {
      case NotificationType.WELCOME_NOTIFICATION:
        return { label: 'WELCOME_NOTIFICATION', icon: '🚀', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' };
      case NotificationType.ALMOST_THERE_NOTIFICATION:
        return { label: 'ALMOST_THERE_NOTIFICATION', icon: '🎯', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300' };
      case NotificationType.CLIENT_RETENTION_NOTIFICATION:
        return { label: 'CLIENT_RETENTION_NOTIFICATION', icon: '⏰', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300' };
      case NotificationType.POINTS_EXPIRATION_NOTIFICATION:
        return { label: 'POINTS_EXPIRATION_NOTIFICATION', icon: '⏳', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300' };
      case NotificationType.PROMOTION_NOTIFICATION:
        return { label: 'PROMOTION_NOTIFICATION', icon: '🔥', bg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' };
      default:
        return { label: 'CUSTOM_NOTIFICATION', icon: '💬', bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300' };
    }
  }

  togglePreview(id: number): void {
    if (this.previewedTemplateId() === id) {
      this.previewedTemplateId.set(null);
    } else {
      this.previewedTemplateId.set(id);
    }
  }

  getSimulatedContent(content: string): string {
    return content
      .replace(/\{nombre\}/g, 'María')
      .replace(/\{empresa\}/g, 'Café Martínez')
      .replace(/\{local\}/g, 'Café Martínez')
      .replace(/\{puntos\}/g, '450')
      .replace(/\{puntos_faltantes\}/g, '50')
      .replace(/\{dias\}/g, '7');
  }
}