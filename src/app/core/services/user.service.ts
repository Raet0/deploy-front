import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { AuthService, Role } from './auth.service';
import { tap } from 'rxjs';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role: Role;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROGRAMMER' | 'USER';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'PROGRAMMER' | 'USER';
}

export interface UpdateMyProfileRequest {
  name?: string;
  photoUrl?: string;
  headline?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  userProfile = signal<UserProfile | null>(null);

  constructor() {
    effect(() => {
      const u = this.auth.currentUser();
      if (!u) {
        this.userProfile.set(null);
        return;
      }
      this.userProfile.set({
        name: u.name,
        email: u.email,
        role: u.role,
      });
    });
  }

  listUsers(page = 0, size = 50) {
    return this.http.get<UserProfile[]>(`${API_BASE_URL}/api/admin/users`, {
      headers: this.auth.getAuthHeaders(),
      params: { page, size },
    });
  }

  createUser(req: CreateUserRequest) {
    return this.http.post<UserProfile>(`${API_BASE_URL}/api/admin/users`, req, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateUser(id: number, req: UpdateUserRequest) {
    return this.http.put<UserProfile>(`${API_BASE_URL}/api/admin/users/${id}`, req, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${API_BASE_URL}/api/admin/users/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getMyProfile() {
    return this.http.get<UserProfile>(`${API_BASE_URL}/api/users/me`, {
      headers: this.auth.getAuthHeaders(),
    }).pipe(
      tap(p => {
        const current = this.auth.currentUser();
        this.userProfile.set({
          id: p.id,
          name: p.name,
          email: p.email,
          role: current?.role ?? this.mapRole(p.role),
          photoUrl: p.photoUrl,
          headline: p.headline,
          bio: p.bio,
          createdAt: p.createdAt,
        });
      })
    );
  }

  updateMyProfile(req: UpdateMyProfileRequest) {
    return this.http.put<UserProfile>(`${API_BASE_URL}/api/users/me`, req, {
      headers: this.auth.getAuthHeaders(),
    }).pipe(
      tap(p => {
        const current = this.auth.currentUser();
        this.userProfile.set({
          id: p.id,
          name: p.name,
          email: p.email,
          role: current?.role ?? this.mapRole(p.role),
          photoUrl: p.photoUrl,
          headline: p.headline,
          bio: p.bio,
          createdAt: p.createdAt,
        });
      })
    );
  }

  currentRole(): Role | null {
    return this.userProfile()?.role ?? null;
  }

  private mapRole(role?: string): Role {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'PROGRAMMER': return 'programmer';
      default: return 'user';
    }
  }
}
