import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CtaBanner {
  protected readonly configService = inject(AppConfigService);
}
