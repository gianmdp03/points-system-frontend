import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../core/services/app-config-service';

export interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
})
export class Faq {
  protected readonly configService = inject(AppConfigService);

  openIndex = signal<number | null>(null);

  readonly faqs: FaqItem[] = [
    {
      question: '¿Los puntos que acumula un usuario vencen o caducan con el tiempo?',
      answer: 'Cada comercio puede definir la validez de sus puntos según su propia estrategia de fidelización, o bien mantenerlos activos indefinidamente mientras el usuario continúe comprando.'
    },
    {
      question: '¿Necesito instalar algún hardware o POS especial para usar la plataforma en mi comercio?',
      answer: 'No. Pointly funciona 100% en la nube desde cualquier dispositivo con navegador (móvil, tablet o computadora) para escanear el QR del cliente y acreditar puntos en segundos.'
    },
    {
      question: '¿Puedo integrar el sistema de puntos con mi e-commerce o sistema de caja existente?',
      answer: 'Sí. A partir de los planes Crecimiento y Corporativo dispones de nuestra API REST y conectores para integrar automáticamente la acreditación de puntos con tu tienda online o sistema POS.'
    },
    {
      question: '¿Tiene algún costo para los clientes registrarse o canjear sus premios?',
      answer: 'Absolutamente ninguno. Para los usuarios la plataforma es 100% gratuita para siempre. Pueden registrarse y acumular beneficios en todos los comercios asociados sin cargo.'
    },
    {
      question: '¿Puedo cambiar de plan o cancelar la suscripción de mi empresa en cualquier momento?',
      answer: 'Sí, no existe contrato de permanencia. Puedes actualizar, bajar de categoría o cancelar la suscripción de tu negocio en cualquier momento directamente desde tu panel de administración.'
    }
  ];

  toggleFaq(index: number): void {
    this.openIndex.update(current => (current === index ? null : index));
  }
}
