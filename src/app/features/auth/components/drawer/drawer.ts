import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeSwitcher } from '../../../landing/components/theme-switcher/theme-switcher';

import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationsBell } from '../../../../shared/components/notifications-bell/notifications-bell';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeSwitcher, CommonModule, NotificationsBell],
  templateUrl: './drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  private authService = inject(AuthService);
  public userService = inject(UserService);

  constructor(public router: Router) {}

  async logout() {
    try {
      await this.authService.logout().toPromise();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al salir:', error);
    }
  }

  getDashboardRoute(): string {
    const role = this.userService.userProfile()?.role;
    switch (role) {
      case 'admin': return '/admin';
      case 'programmer': return '/programmer';
      default: return '/user';
    }
  }

  isHome(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/#');
  }

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }
}
