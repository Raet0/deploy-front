import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

export interface AdvisoryReportItem {
  programmerName: string;
  status: string;
  total: number;
}

export interface ProjectReportItem {
  programmerName: string;
  totalActive: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  advisorySummary(filters?: { from?: string; to?: string; status?: string }) {
    let params = new HttpParams();
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<AdvisoryReportItem[]>(`${API_BASE_URL}/api/reports/advisories`, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  projectSummary() {
    return this.http.get<ProjectReportItem[]>(`${API_BASE_URL}/api/reports/projects`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  advisoryPdf(filters?: { from?: string; to?: string; status?: string }) {
    let params = new HttpParams();
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get(`${API_BASE_URL}/api/reports/advisories/pdf`, {
      headers: this.auth.getAuthHeaders(),
      params,
      responseType: 'blob',
    });
  }

  projectExcel() {
    return this.http.get(`${API_BASE_URL}/api/reports/projects/excel`, {
      headers: this.auth.getAuthHeaders(),
      responseType: 'blob',
    });
  }
}
