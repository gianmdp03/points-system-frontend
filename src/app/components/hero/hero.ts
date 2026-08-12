import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly configService = inject(AppConfigService);
}
