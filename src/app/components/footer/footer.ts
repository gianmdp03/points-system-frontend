import { Component, inject } from '@angular/core';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly configService = inject(AppConfigService);
}
