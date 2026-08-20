import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly slides = signal<CarouselSlide[]>([
    {
      id: 1,
      title: 'Acumula Puntos en tus Comercios Favoritos',
      subtitle: 'Suma recompensas por cada compra registrada con tu DNI y canjéalos por premios exclusivos.',
      badge: 'Fidelización Inteligente'
    },
    {
      id: 2,
      title: 'Promociones Especiales y Multiplicadores',
      subtitle: 'Aprovecha las campañas activas para duplicar o triplicar tus puntos acumulados.',
      badge: 'Ofertas Exclusivas'
    },
    {
      id: 3,
      title: 'Canjea Premios y Vouchers al Instante',
      subtitle: 'Descubre el catálogo de productos y beneficios que tus tiendas favoritas tienen preparados.',
      badge: 'Recompensas Instantáneas'
    }
  ]);

  readonly activeIndex = signal<number>(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    this.activeIndex.update(curr => (curr + 1) % this.slides().length);
  }

  prevSlide(): void {
    this.activeIndex.update(curr => (curr - 1 + this.slides().length) % this.slides().length);
  }

  goToSlide(index: number): void {
    this.activeIndex.set(index);
    this.resetAutoplay();
  }

  private startAutoplay(): void {
    this.timer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
