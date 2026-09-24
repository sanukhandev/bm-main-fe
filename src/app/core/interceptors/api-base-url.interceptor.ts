import { HttpInterceptorFn } from '@angular/common/http';
import { apiUrl } from '../config/runtime-config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/sanctum/')) {
    return next(req.clone({ url: apiUrl(req.url) }));
  }

  return next(req);
};
