import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { PlanLimitModalService } from '../services/plan-limit-modal-service';

export const conflictErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const planLimitModalService = inject(PlanLimitModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 409) {
        const errorBody = error.error;
        let errorMessage = 'Has alcanzado un límite en tu plan actual. Por favor, actualiza a un plan superior para continuar.';

        if (typeof errorBody === 'string') {
          errorMessage = errorBody;
        } else if (errorBody && typeof errorBody.message === 'string') {
          errorMessage = errorBody.message;
        } else if (errorBody && typeof errorBody.error === 'string') {
          errorMessage = errorBody.error;
        }

        // Solo abrir el modal de upgrade de plan si el error corresponde explícitamente a un límite/restricción de plan
        const isPlanLimit = /l[ií]mite|plan|superior|upgrade|cupo|desactiva|suscribete/i.test(errorMessage);
        if (isPlanLimit) {
          planLimitModalService.open({
            title: 'Límite del Plan Alcanzado',
            message: errorMessage,
            upgradeRoute: '/dashboard/pricing'
          });
        }
      }

      return throwError(() => error);
    })
  );
};
