import { Component, inject } from '@angular/core';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfo {
  protected readonly configService = inject(AppConfigService);
}
