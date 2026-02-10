import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService, Notification } from '../../core/services/notifications';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-page.html',
})
export class NotificationsPage implements OnInit {
  authService = inject(AuthService);
  notificationsService = inject(NotificationsService);

  allNotifications = signal<Notification[]>([]);
  selectedNotification = signal<Notification | null>(null);
  responseText = signal<string>('');
  isLoading = signal(false);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.notificationsService.loadNotifications(user.email, user.role);
      // Cargar todas las notificaciones
      this.allNotifications.set(this.notificationsService.notifications());
    }
  }

  selectNotification(notification: Notification) {
    this.selectedNotification.set(notification);
    this.responseText.set('');
  }

  respondToNotification() {
    const notification = this.selectedNotification();
    if (!notification || !this.responseText()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    this.isLoading.set(true);

    // Enviar respuesta al backend
    // TODO: agregar endpoint en el backend para esto
    console.log('Respuesta enviada:', {
      notificationId: notification.id,
      response: this.responseText(),
      status: notification.status === 'PENDIENTE' ? 'APROBADA' : notification.status,
    });

    // Simular envío
    setTimeout(() => {
      this.isLoading.set(false);
      alert('Respuesta enviada');
      this.selectedNotification.set(null);
      this.responseText.set('');
    }, 1000);
  }

  deleteNotification(id: number) {
    const current = this.allNotifications();
    this.allNotifications.set(current.filter(n => n.id !== id));
  }
}