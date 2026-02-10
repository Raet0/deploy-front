import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectByRoleGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  await auth.waitForAuth();
  const user = auth.currentUser();

  if (!user) return true;

  switch (user.role) {
    case 'admin':
      router.navigate(['/admin']);
      break;
    case 'programmer':
      router.navigate(['/programmer']);
      break;
    default:
      router.navigate(['/user']);
  }
  return false;
};
