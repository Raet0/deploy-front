import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, message: string, title?: string, timeout = 3500) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, title, message, timeout };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => this.remove(id), timeout);
  }

  success(message: string, title = 'Listo') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error') {
    this.show('error', message, title, 4500);
  }

  info(message: string, title = 'Info') {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Atención') {
    this.show('warning', message, title);
  }

  remove(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
