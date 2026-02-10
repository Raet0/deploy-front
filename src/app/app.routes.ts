import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { redirectByRoleGuard } from './core/guards/redirect-by-role.guard';
import { roleGuard } from './core/guards/role.guards';
import { UserProfilePage } from './features/auth/pages/user-profile/user-profile';
import { NotificationsPage } from './pages/notifications-page/notifications-page';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/landing/landing').then(m => m.Landing),
  },
  {
    path: 'profiles',
    loadComponent: () =>
      import('./features/landing/components/profiles/profiles').then(m => m.Profiles),
  },
  {
    path: 'programmers/:id',
    loadComponent: () =>
      import('./features/landing/pages/programmer-profile/programmer-profile').then(
        m => m.ProgrammerProfilePage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then(m => m.LoginPage),
    canActivate: [redirectByRoleGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then(m => m.RegisterPage),
    canActivate: [redirectByRoleGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./pages/admin-page/admin-page').then(m => m.AdminPageComponent),
  },
  {
    path: 'programmer',
    canActivate: [authGuard, roleGuard(['programmer'])],
    loadComponent: () =>
      import('./pages/programmer-page/programmer-page').then(m => m.ProgrammerPage),
  },
  {
    path: 'user',
    canActivate: [authGuard, roleGuard(['user'])],
    loadComponent: () =>
      import('./pages/user-page/user-page').then(m => m.UserPageComponent),
  },
  {
    path: 'profile',
    component: UserProfilePage,
  },
  {
    path: 'notifications',
    component: NotificationsPage,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
