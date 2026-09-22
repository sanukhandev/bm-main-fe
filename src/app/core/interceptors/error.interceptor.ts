import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../api/api.models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let normalizedError: ApiErrorResponse = {
        message: 'An unexpected error occurred.',
        code: 'INTERNAL_SERVER_ERROR',
      };

      if (error.error && typeof error.error === 'object') {
        normalizedError = {
          message: error.error.message || normalizedError.message,
          code: error.error.code || (error.status === 422 ? 'VALIDATION_ERROR' : 'ERROR'),
          errors: error.error.errors,
          request_id: error.error.request_id,
        };
      } else if (error.status === 0) {
        normalizedError.message = 'Unable to connect to the server. Please check your network.';
        normalizedError.code = 'NETWORK_ERROR';
      }

      if (error.status === 401 && !req.url.includes('/api/v1/auth/login')) {
        router.navigate(['/login'], { queryParams: { expired: '1' } });
      }

      return throwError(() => normalizedError);
    })
  );
};
