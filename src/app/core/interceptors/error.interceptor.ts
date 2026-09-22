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
        normalizedError.message = 'Unable to connect to backend server. Please verify backend (Laravel) is running at http://127.0.0.1:8000.';
        normalizedError.code = 'NETWORK_ERROR';
      } else if (error.status === 404) {
        normalizedError.message = 'API endpoint not found (404). Please check backend routing and proxy configuration.';
        normalizedError.code = 'NOT_FOUND';
      } else if (typeof error.error === 'string' && error.error.includes('<!DOCTYPE html>')) {
        normalizedError.message = `Backend returned non-JSON response (${error.status}). Check backend proxy configuration.`;
        normalizedError.code = 'INVALID_RESPONSE';
      } else if (error.message) {
        normalizedError.message = error.message;
      }

      if (error.status === 401 && !req.url.includes('/api/v1/auth/login')) {
        router.navigate(['/login'], { queryParams: { expired: '1' } });
      }

      return throwError(() => normalizedError);
    })
  );
};
