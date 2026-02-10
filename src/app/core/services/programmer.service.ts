import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';
import type { ProgrammerProfile, Project, Advisory, AvailabilitySlot, AvailabilityRequest } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ProgrammerService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // --- PROGRAMMER (privado) ---
  getMyProfile() {
    return this.http.get<ProgrammerProfile>(`${API_BASE_URL}/api/programmer/me`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateMyProfile(payload: Partial<ProgrammerProfile>) {
    return this.http.put<ProgrammerProfile>(`${API_BASE_URL}/api/programmer/profile`, payload, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  createProject(payload: Partial<Project>) {
    return this.http.post<Project>(`${API_BASE_URL}/api/programmer/projects`, payload, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  listProjects() {
    return this.http.get<Project[]>(`${API_BASE_URL}/api/programmer/projects`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateProject(id: number, payload: Partial<Project>) {
    return this.http.put<Project>(`${API_BASE_URL}/api/programmer/projects/${id}`, payload, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteProject(id: number) {
    return this.http.delete<void>(`${API_BASE_URL}/api/programmer/projects/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addAvailability(payload: AvailabilityRequest) {
    return this.http.post<AvailabilitySlot>(`${API_BASE_URL}/api/programmer/availability`, payload, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  listAvailability() {
    return this.http.get<AvailabilitySlot[]>(`${API_BASE_URL}/api/programmer/availability`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteAvailability(id: number) {
    return this.http.delete<void>(`${API_BASE_URL}/api/programmer/availability/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  listAdvisories() {
    return this.http.get<Advisory[]>(`${API_BASE_URL}/api/programmer/advisories`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateAdvisoryStatus(id: number, status: 'APROBADA' | 'RECHAZADA', response?: string) {
    return this.http.patch<Advisory>(
      `${API_BASE_URL}/api/programmer/advisories/${id}`,
      { status, response },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  // --- PUBLICO ---
  listProgrammersPublic() {
    return this.http.get<ProgrammerProfile[]>(`${API_BASE_URL}/api/programmers`);
  }

  getProgrammerPublic(id: number) {
    return this.http.get<ProgrammerProfile>(`${API_BASE_URL}/api/programmers/${id}`);
  }

  listProjectsPublic(profileId: number) {
    return this.http.get<Project[]>(`${API_BASE_URL}/api/programmers/${profileId}/projects`);
  }

  listAvailabilityPublic(profileId: number) {
    return this.http.get<AvailabilitySlot[]>(`${API_BASE_URL}/api/programmers/${profileId}/availability`);
  }

  createAdvisory(payload: Partial<Advisory>) {
    return this.http.post<Advisory>(`${API_BASE_URL}/api/advisories`, payload);
  }

  listAdvisoriesByRequester(email: string) {
    return this.http.get<Advisory[]>(`${API_BASE_URL}/api/advisories`, {
      params: { email },
    });
  }
}
