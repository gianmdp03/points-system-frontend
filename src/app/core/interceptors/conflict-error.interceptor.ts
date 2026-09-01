import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { PlanLimitModalService } from '../services/plan-limit-modal-service';

export const conflictErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const planLimitModalService = inject(PlanLimitModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 409 || error.status === 403 || error.status === 402 || error.status === 400) {
        const errorBody = error.error;
        let errorMessage = '';

        if (typeof errorBody === 'string') {
          errorMessage = errorBody;
        } else if (errorBody && typeof errorBody.message === 'string') {
          errorMessage = errorBody.message;
        } else if (errorBody && typeof errorBody.error === 'string') {
          errorMessage = errorBody.error;
        }

        // 1. Detección específica de Contracargo / Suspensión por Deuda
        const isChargeback = /contracargo|chargeback|desconocimiento|deuda|suspendid|bloquead/i.test(errorMessage);
        if (isChargeback) {
          planLimitModalService.openChargeback({
            message: errorMessage || 'Se ha registrado un desconocimiento de pago en tu cuenta. Todas las operaciones comerciales se encuentran pausadas.'
          });
          return throwError(() => error);
        }

        // 2. Detección de límite o restricción de plan (HTTP 409)
        if (error.status === 409) {
          const isPlanLimit = /l[ií]mite|plan|superior|upgrade|cupo|desactiva|suscribete/i.test(errorMessage);
          if (isPlanLimit) {
            planLimitModalService.open({
              title: 'Límite del Plan Alcanzado',
              message: errorMessage || 'Has alcanzado un límite en tu plan actual. Por favor, actualiza a un plan superior para continuar.',
              upgradeRoute: '/dashboard/pricing'
            });
          }
        }
      }

      return throwError(() => error);
    })
  );
};
