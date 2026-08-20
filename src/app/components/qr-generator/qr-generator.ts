import {
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
  AfterViewInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-generator.html'
})
export class QrGeneratorComponent implements AfterViewInit {
  readonly companyId = input.required<number>();
  readonly companyName = input<string>('');

  readonly qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');
  readonly isReady = signal<boolean>(false);
  readonly qrUrl = signal<string>('');

  constructor() {
    effect(() => {
      const id = this.companyId();
      if (id && typeof window !== 'undefined') {
        this.qrUrl.set(`${window.location.origin}/join/${id}`);
        if (this.qrCanvas()?.nativeElement) {
          this.generateQR();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.generateQR();
  }

  generateQR(): void {
    const canvas = this.qrCanvas()?.nativeElement;
    if (!canvas || !this.companyId() || typeof window === 'undefined') return;

    const url = `${window.location.origin}/join/${this.companyId()}`;
    this.qrUrl.set(url);

    QRCode.toCanvas(
      canvas,
      url,
      {
        errorCorrectionLevel: 'H',
        width: 320,
        margin: 2,
        color: {
          dark: '#1F1F1F',
          light: '#FFFFFF'
        }
      },
      (error) => {
        if (error) {
          console.error('Error al generar código QR:', error);
          return;
        }
        this.drawLogo(canvas);
      }
    );
  }

  private drawLogo(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.isReady.set(true);
      return;
    }

    const logo = new Image();
    logo.src = 'logo.svg';
    logo.crossOrigin = 'anonymous';

    logo.onload = () => {
      const logoSize = canvas.width * 0.25;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      const padding = 5;

      // Dibujar fondo blanco detrás del logo
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      const bgX = x - padding;
      const bgY = y - padding;
      const bgSize = logoSize + padding * 2;

      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bgX, bgY, bgSize, bgSize, 6);
      } else {
        ctx.rect(bgX, bgY, bgSize, bgSize);
      }
      ctx.fill();

      // Dibujar logo centrado
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      this.isReady.set(true);
    };

    logo.onerror = () => {
      this.isReady.set(true);
    };
  }

  downloadQR(): void {
    const canvas = this.qrCanvas()?.nativeElement;
    if (!canvas) return;

    const link = document.createElement('a');
    const safeName = (this.companyName() || `empresa-${this.companyId()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');
    link.download = `pointly-qr-${safeName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  printQR(): void {
    const canvas = this.qrCanvas()?.nativeElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const compName = this.companyName() || 'Nuestro Comercio';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cartel QR - ${compName}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-align: center;
              padding: 24px;
              color: #1F1F1F;
              background-color: #FFFFFF;
            }
            .card {
              max-width: 420px;
              margin: 0 auto;
              padding: 32px 24px;
              border: 2px solid #C4C7C5;
              border-radius: 28px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .logo-header {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-weight: 900;
              font-size: 18px;
              color: #1A73E8;
              margin-bottom: 16px;
            }
            h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
            h2 { margin: 0 0 16px 0; font-size: 15px; color: #1A73E8; font-weight: 700; }
            p.desc { margin: 0 0 20px 0; color: #5F6368; font-size: 13px; line-height: 1.5; }
            .qr-wrapper {
              display: inline-block;
              padding: 12px;
              background: #FFFFFF;
              border: 1px solid #C4C7C5;
              border-radius: 20px;
              margin-bottom: 20px;
            }
            img.qr-img { width: 260px; height: 260px; display: block; border-radius: 12px; }
            .steps {
              display: flex;
              justify-content: space-around;
              font-size: 12px;
              font-weight: 700;
              color: #1F1F1F;
              margin: 16px 0;
              padding: 12px;
              background: #F8F9FA;
              border-radius: 12px;
            }
            .footer { font-size: 11px; color: #9AA0A6; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-header">Pointly</div>
            <h1>¡Sumá Puntos con tus Compras!</h1>
            <h2>${compName}</h2>
            <p class="desc">Escaneá este código QR con la cámara de tu celular para registrarte al instante en nuestro programa de beneficios.</p>
            <div class="qr-wrapper">
              <img class="qr-img" src="${dataUrl}" alt="Código QR de Registro" />
            </div>
            <div class="steps">
              <span>1. Escaneá</span>
              <span>•</span>
              <span>2. Registrate</span>
              <span>•</span>
              <span>3. Pedí tus Puntos</span>
            </div>
            <div class="footer">Fidelización inteligente para comercios y clientes</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
