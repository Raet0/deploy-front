import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, Role } from '../services/auth.service';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return async () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    await auth.waitForAuth();
    const user = auth.currentUser();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      router.navigate(['/user']);
      return false;
    }

    return true;
  };
};
