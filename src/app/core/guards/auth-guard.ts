import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = async (_route, state) => {
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
