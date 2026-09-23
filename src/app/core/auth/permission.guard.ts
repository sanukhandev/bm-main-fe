import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const accountsViewGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasPermission('accounts.view')
    ? true
    : inject(Router).createUrlTree(['/app/dashboard']);
};
