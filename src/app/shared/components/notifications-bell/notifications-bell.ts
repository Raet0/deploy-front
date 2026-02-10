import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from '../../../core/services/notifications';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-bell.html',
})
export class NotificationsBell implements OnInit {
  authService = inject(AuthService);
  notificationsService = inject(NotificationsService);
  router = inject(Router);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.notificationsService.loadNotifications(user.email, user.role);
    }
  }
  markAsRead(notificationId: number) {
    // ✅ Guardar en localStorage que fue leída
    this.notificationsService.markAsRead(notificationId);

    // Eliminar de la lista
    const current = this.notificationsService.notifications();
    const filtered = current.filter((n) => n.id !== notificationId);
    this.notificationsService.notifications.set(filtered);

    // Actualizar contador
    this.notificationsService.notificationCount.set(filtered.length);
  }
  goToAllNotifications() {
    this.router.navigate(['/notifications']);
  }
}
