import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const auditViewGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasPermission('audit.view') ? true : inject(Router).createUrlTree(['/app/dashboard']);
};
