import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private baseUrl = 'http://localhost:8081/api';
  private readNotificationsKey = 'read_notifications';

  notificationCount = signal<number>(0);
  notifications = signal<Notification[]>([]);

  private authHeaders(): HttpHeaders {
    const token = this.auth.currentUser()?.token || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getPendingAdvisories() {
    return this.http.get<any[]>(`${this.baseUrl}/programmer/advisories`, {
      headers: this.authHeaders(),
    });
  }

  getMyAdvisories() {
    return this.http.get<any[]>(`${this.baseUrl}/programmer/advisories/requester`, {
      headers: this.authHeaders(),
    });
  }

  // ✅ Obtener las notificaciones ya leídas desde localStorage
  private getReadNotifications(): number[] {
    const stored = localStorage.getItem(this.readNotificationsKey);
    return stored ? JSON.parse(stored) : [];
  }

  // ✅ Guardar una notificación como leída
  markAsRead(notificationId: number) {
    const readIds = this.getReadNotifications();
    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId);
      localStorage.setItem(this.readNotificationsKey, JSON.stringify(readIds));
    }
  }

  loadNotifications(userEmail: string, userRole: string) {
    const readIds = this.getReadNotifications();

    if (userRole === 'programmer') {
      this.getPendingAdvisories().subscribe({
        next: (advisories) => {
          // ✅ Filtrar solo las no leídas
          const pending = advisories
            .filter((a: any) => a.status === 'PENDIENTE')
            .filter((a: any) => !readIds.includes(a.id));

          this.notificationCount.set(pending.length);
          this.notifications.set(
            pending.map((a: any) => ({
              id: a.id,
              title: 'Nueva solicitud de asesoría',
              message: `${a.requesterName} solicita una asesoría`,
              status: a.status,
              createdAt: a.scheduledAt,
            }))
          );
        },
      });
    } else if (userRole === 'user') {
      this.getMyAdvisories().subscribe({
        next: (advisories) => {
          // ✅ Filtrar solo las no leídas
          const resolved = advisories
            .filter((a: any) => a.status !== 'PENDIENTE')
            .filter((a: any) => !readIds.includes(a.id));

          this.notificationCount.set(resolved.length);
          this.notifications.set(
            resolved.map((a: any) => ({
              id: a.id,
              title: a.status === 'APROBADA' ? 'Solicitud aprobada' : 'Solicitud rechazada',
              message: `Tu solicitud con ${a.programmerName} fue ${a.status === 'APROBADA' ? 'aprobada' : 'rechazada'}`,
              status: a.status,
              createdAt: a.scheduledAt,
            }))
          );
        },
      });
    }
  }
}