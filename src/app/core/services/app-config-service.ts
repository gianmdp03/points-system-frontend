import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  readonly appName = signal<string>(environment.appName || 'Pointly');
  readonly appTitle = signal<string>(environment.appTitle || 'Pointly - Fidelización para Empresas y Recompensas para Clientes');
}
