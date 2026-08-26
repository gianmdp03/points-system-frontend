import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { SupabaseService } from '../services/supabase-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabaseService = inject(SupabaseService);

  return from(supabaseService.getToken()).pipe(
    switchMap(token => {
      const headersConfig: Record<string, string> = {
        'ngrok-skip-browser-warning': 'true'
      };

      if (token) {
        headersConfig['Authorization'] = `Bearer ${token}`;
      }

      const cloned = req.clone({
        setHeaders: headersConfig
      });
      return next(cloned);
    })
  );
};
