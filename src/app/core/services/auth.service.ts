import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';
import { API_BASE_URL } from './api.config';

export type Role = 'admin' | 'programmer' | 'user';

export interface AuthResponse {
  token: string;
  name: string;
  role: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private currentUserSignal = signal<AuthUser | null>(null);
  private authInitialized: Promise<void>;

  constructor() {
    this.authInitialized = new Promise((resolve) => {
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        this.currentUserSignal.set(JSON.parse(raw));
      }
      resolve();
    });
  }

  waitForAuth(): Promise<void> {
    return this.authInitialized;
  }

  currentUser(): AuthUser | null {
    return this.currentUserSignal();
  }

  login(email: string, pass: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, { email, password: pass })
      .pipe(
        map((res) => {
          const user: AuthUser = {
            name: res.name,
            email,
            role: this.mapRole(res.role),
            token: res.token,
          };
          return user;
        }),
        tap((user) => this.saveSession(user))
      );
  }

  loginWithGoogle(idToken: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/auth/google`, { idToken })
      .pipe(
        map((res) => {
          const user: AuthUser = {
            name: res.name,
            email: '',
            role: this.mapRole(res.role),
            token: res.token,
          };
          return user;
        }),
        tap((user) => this.saveSession(user))
      );
  }

  registerAdmin(name: string, email: string, pass: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/auth/register-admin`, {
        name,
        email,
        password: pass,
      })
      .pipe(
        map((res) => {
          const user: AuthUser = {
            name: res.name,
            email,
            role: this.mapRole(res.role),
            token: res.token,
          };
          return user;
        }),
        tap((user) => this.saveSession(user))
      );
  }

  logout(): Observable<void> {
    return of(void 0).pipe(
      tap(() => {
        localStorage.removeItem('auth_user');
        this.currentUserSignal.set(null);
      })
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.currentUserSignal()?.token;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private saveSession(user: AuthUser) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private mapRole(role: string): Role {
    switch (role) {
      case 'ADMIN':
        return 'admin';
      case 'PROGRAMMER':
        return 'programmer';
      default:
        return 'user';
    }
  }
}
