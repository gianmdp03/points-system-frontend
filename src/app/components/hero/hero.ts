import { Component, inject } from '@angular/core';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly configService = inject(AppConfigService);
}
