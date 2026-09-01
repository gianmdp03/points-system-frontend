import { Component, input, output, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MessageTemplateListDTO,
  MessageTemplateDetailDTO,
  NotificationType,
  NOTIFICATION_TYPE_CONFIG,
  NotificationTypeMetadata,
  Role,
  CompanyDetailDTO
} from '../../../../core/models';

export interface CategoryGroup {
  type: NotificationType;
  metadata: NotificationTypeMetadata;
  templates: MessageTemplateListDTO[];
  activeCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-tab-message-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tab-message-templates.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class TabMessageTemplatesComponent {
  readonly company = input<CompanyDetailDTO | null>(null);
  readonly templates = input<MessageTemplateListDTO[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly currentRole = input<Role | null>(null);
  readonly isResettingDefaults = input<boolean>(false);

  readonly addTemplate = output<void>();
  readonly addTemplateWithType = output<NotificationType>();
  readonly editTemplate = output<MessageTemplateListDTO>();
  readonly toggleTemplate = output<MessageTemplateListDTO>();
  readonly deleteTemplate = output<MessageTemplateListDTO>();
  readonly resetDefaults = output<void>();
  readonly updateRetentionSettings = output<{ enabled: boolean; days: number }>();

  readonly RoleEnum = Role;
  readonly NotificationTypeEnum = NotificationType;
  readonly typeConfigs = NOTIFICATION_TYPE_CONFIG;

  readonly selectedFilter = signal<string>('ALL');
  readonly searchTerm = signal<string>('');
  readonly previewedTemplateId = signal<number | null>(null);
  readonly randomPickedTemplateId = signal<{ [key in NotificationType]?: number }>({});
  readonly randomPickNotice = signal<{ [key in NotificationType]?: string }>({});

  // Retention Inline Configuration Signals
  readonly retentionDaysDraft = signal<number>(20);
  readonly retentionEnabledDraft = signal<boolean>(false);

  constructor() {
    effect(() => {
      const comp = this.company();
      if (comp) {
        this.retentionEnabledDraft.set(comp.isClientRetentionEnabled ?? false);
        this.retentionDaysDraft.set(comp.clientRetentionDays ?? 20);
      }
    });
  }

  readonly allCategories: NotificationType[] = [
    NotificationType.WELCOME_NOTIFICATION,
    NotificationType.ALMOST_THERE_NOTIFICATION,
    NotificationType.CLIENT_RETENTION_NOTIFICATION,
    NotificationType.POINTS_EXPIRATION_NOTIFICATION,
    NotificationType.PROMOTION_NOTIFICATION,
    NotificationType.CUSTOM_NOTIFICATION
  ];

  readonly totalActiveTemplates = computed(() => {
    return this.templates().filter(t => t.isEnabled).length;
  });

  readonly categoryGroups = computed<CategoryGroup[]>(() => {
    const list = this.templates();
    const filter = this.selectedFilter();
    const search = this.searchTerm().trim().toLowerCase();

    return this.allCategories
      .filter(cat => filter === 'ALL' || filter === cat)
      .map(cat => {
        const metadata = this.typeConfigs[cat];
        const allCategoryTemplates = list.filter(t => t.type === cat);
        const activeCount = allCategoryTemplates.filter(t => t.isEnabled).length;

        let filteredTemplates = allCategoryTemplates;
        if (search) {
          filteredTemplates = filteredTemplates.filter(t =>
            t.name.toLowerCase().includes(search) ||
            (t.subject && t.subject.toLowerCase().includes(search)) ||
            t.content.toLowerCase().includes(search)
          );
        }

        return {
          type: cat,
          metadata,
          templates: filteredTemplates,
          activeCount,
          totalCount: allCategoryTemplates.length
        };
      });
  });

  togglePreview(id: number): void {
    if (this.previewedTemplateId() === id) {
      this.previewedTemplateId.set(null);
    } else {
      this.previewedTemplateId.set(id);
    }
  }

  saveRetentionSettings(): void {
    const enabled = this.retentionEnabledDraft();
    const days = Math.max(1, this.retentionDaysDraft() || 20);
    this.updateRetentionSettings.emit({ enabled, days });
  }

  testRandomSelection(group: CategoryGroup): void {
    const activeList = group.templates.filter(t => t.isEnabled);
    if (activeList.length === 0) {
      alert('No hay variantes activas en esta categoría para seleccionar.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * activeList.length);
    const chosen = activeList[randomIndex];

    this.randomPickedTemplateId.update(prev => ({ ...prev, [group.type]: chosen.id }));
    this.randomPickNotice.update(prev => ({
      ...prev,
      [group.type]: `🎲 ¡Selección aleatoria: "${chosen.name}" (${randomIndex + 1} de ${activeList.length} activas)!`
    }));

    // Auto-expand preview of chosen template
    this.previewedTemplateId.set(chosen.id);

    setTimeout(() => {
      this.randomPickNotice.update(prev => {
        const next = { ...prev };
        delete next[group.type];
        return next;
      });
    }, 4500);
  }

  getSimulatedSubject(subject?: string): string {
    if (!subject) return 'Notificación del Club de Fidelización';
    return this.applyReplacements(subject);
  }

  getSimulatedContent(content: string): string {
    if (!content) return '';
    return this.applyReplacements(content);
  }

  private applyReplacements(text: string): string {
    return text
      .replace(/\{nombre\}/g, 'María')
      .replace(/\{empresa\}/g, 'Café Martínez')
      .replace(/\{local\}/g, 'Sucursal Centro')
      .replace(/\{puntos\}/g, '450')
      .replace(/\{puntos_faltantes\}/g, '50')
      .replace(/\{dias\}/g, '30');
  }
}
