import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { BmLoadingService } from '../services/bm-loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip background polling or silent AI assistant calls if headers dictate
  if (req.headers.has('X-Skip-Loader')) {
    return next(req);
  }

  const loadingService = inject(BmLoadingService);
  loadingService.showHttpLoader();

  return next(req).pipe(
    finalize(() => {
      loadingService.hideHttpLoader();
    }),
  );
};
