import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BranchContextService } from '../branch-context/branch-context.service';

export const branchInterceptor: HttpInterceptorFn = (req, next) => {
  const branchContext = inject(BranchContextService);
  const activeBranchId = branchContext.activeBranchId();

  // Exclude auth routes from X-Branch-Id header
  const isAuthRoute = req.url.includes('/api/v1/auth/');
  const isSanctum = req.url.includes('/sanctum/');

  if (activeBranchId && !isAuthRoute && !isSanctum && req.url.includes('/api/v1/')) {
    const modifiedReq = req.clone({
      headers: req.headers.set('X-Branch-Id', String(activeBranchId)),
    });
    return next(modifiedReq);
  }

  return next(req);
};
