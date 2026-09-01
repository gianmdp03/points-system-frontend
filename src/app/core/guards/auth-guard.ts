import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const platformId = inject(PLATFORM_ID);

  // En SSR (Node.js) no hay acceso al localStorage del navegador de Supabase.
  // Dejamos pasar la renderización del servidor para que el guard en el navegador cliente
  // evalúe la sesión real con acceso a localStorage sin forzar una redirección errónea al login en cada F5.
  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  // Asegura que la verificación de sesión en Supabase haya concluido (útil en refrescos o links directos)
  const isLogged = await authService.ensureInitialized();

  if (isLogged) {
    return true;
  }

  // Redirige al login indicando la razón y conservando la ruta solicitada
  return router.createUrlTree(['/login'], {
    queryParams: {
      reason: 'auth_required',
      returnUrl: state.url
    }
  });
};
