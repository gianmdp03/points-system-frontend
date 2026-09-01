import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointsAccountDetailDTO, MessageTemplateListDTO } from '../../../../../core/models';

@Component({
  selector: 'app-whatsapp-retention-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-retention-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhatsappRetentionModalComponent {
  readonly account = input.required<PointsAccountDetailDTO>();
  readonly companyName = input<string>('Mi Comercio');
  readonly retentionTemplates = input<MessageTemplateListDTO[]>([]);

  readonly close = output<void>();

  readonly selectedTemplateIndex = signal<number>(0);
  readonly phoneNumberInput = signal<string>('');
  readonly messageText = signal<string>('');
  readonly isCopied = signal<boolean>(false);

  private readonly defaultFallbackTemplate = 
    '¡Hola {nombre}! Te extrañamos en {empresa}. Hace más de {dias} días que no nos visitas y tienes {puntos} puntos acumulados esperándote. ¡Vení a canjearlos hoy!';

  constructor() {
    effect(() => {
      const acc = this.account();
      const rawPhone = acc.client?.phone || '';
      this.phoneNumberInput.set(this.formatInitialPhone(rawPhone, acc.client?.country));
      this.loadTemplateMessage(this.selectedTemplateIndex());
    });
  }

  readonly inactiveDays = computed(() => {
    const dateStr = this.account()?.lastActivityDate;
    if (!dateStr) return 30;
    const activityDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  });

  readonly currentTemplatesList = computed(() => {
    const list = this.retentionTemplates();
    return list.length > 0 ? list : [];
  });

  selectTemplate(index: number): void {
    this.selectedTemplateIndex.set(index);
    this.loadTemplateMessage(index);
  }

  private loadTemplateMessage(index: number): void {
    const list = this.currentTemplatesList();
    let rawContent = this.defaultFallbackTemplate;

    if (list.length > 0 && list[index]) {
      rawContent = list[index].content;
    }

    const replaced = this.applyReplacements(rawContent);
    this.messageText.set(replaced);
  }

  private applyReplacements(text: string): string {
    const acc = this.account();
    const clientName = acc.client?.name || 'Cliente';
    const compName = this.companyName() || 'nuestro local';
    const balance = acc.balance ?? 0;
    const days = this.inactiveDays();

    return text
      .replace(/\{nombre\}/gi, clientName)
      .replace(/\{empresa\}/gi, compName)
      .replace(/\{local\}/gi, compName)
      .replace(/\{puntos\}/gi, balance.toString())
      .replace(/\{puntos_faltantes\}/gi, '0')
      .replace(/\{dias\}/gi, days.toString());
  }

  private formatInitialPhone(phone: string, country?: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return '';

    // If starts with +, strip +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // Smart default for Argentina if number is 10 digits (e.g. 11 1234 5678 or 223 123 4567)
    const isArgentina = !country || country.toLowerCase().includes('arg');
    if (isArgentina && cleaned.length === 10 && !cleaned.startsWith('54')) {
      cleaned = '549' + cleaned;
    } else if (isArgentina && cleaned.startsWith('54') && !cleaned.startsWith('549') && cleaned.length === 12) {
      cleaned = '549' + cleaned.substring(2);
    }

    return cleaned;
  }

  readonly sanitizedPhone = computed(() => {
    return this.phoneNumberInput().replace(/[^\d]/g, '');
  });

  readonly whatsappUrl = computed(() => {
    const phone = this.sanitizedPhone();
    const encoded = encodeURIComponent(this.messageText().trim());
    if (!phone) return '';
    return `https://wa.me/${phone}?text=${encoded}`;
  });

  readonly isValidPhone = computed(() => {
    const digits = this.sanitizedPhone();
    return digits.length >= 8 && digits.length <= 16;
  });

  openWhatsApp(): void {
    const url = this.whatsappUrl();
    if (!url || !this.isValidPhone()) {
      alert('Por favor ingresa un número de teléfono válido con código de país.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyMessage(): void {
    const text = this.messageText();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    });
  }
}
