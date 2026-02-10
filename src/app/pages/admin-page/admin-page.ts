import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserService,
  CreateUserRequest,
  UserProfile,
  UpdateUserRequest,
} from '../../core/services/user.service';
import { ToastService } from '../../core/ui/toast.service';
import { Drawer } from '../../features/auth/components/drawer/drawer';
import { ReportService, AdvisoryReportItem, ProjectReportItem } from '../../core/services/report.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer],
  templateUrl: './admin-page.html',
})
export class AdminPageComponent implements OnInit {
  private userService = inject(UserService);
  private reportService = inject(ReportService);
  private toast = inject(ToastService);

  users = signal<UserProfile[]>([]);
  loadingUsers = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  formErrors = signal<{ name?: string; email?: string; password?: string }>({});
  editErrors = signal<{ name?: string; email?: string }>({});

  form = signal<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    role: 'PROGRAMMER',
  });

  editForm = signal<UpdateUserRequest & { id?: number }>({
    id: undefined,
    name: '',
    email: '',
    role: 'USER',
  });

  reportFrom = signal<string>('');
  reportTo = signal<string>('');
  reportStatus = signal<string>('');
  loadingReports = signal(false);

  advisorySummary = signal<AdvisoryReportItem[]>([]);
  projectSummary = signal<ProjectReportItem[]>([]);

  ngOnInit() {
    this.loadUsers();
    this.loadReports();
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.userService.listUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar usuarios.');
        this.loadingUsers.set(false);
      },
    });
  }

  loadReports() {
    this.loadingReports.set(true);
    const filters = {
      from: this.reportFrom() || undefined,
      to: this.reportTo() || undefined,
      status: this.reportStatus() || undefined,
    };

    this.reportService.advisorySummary(filters).subscribe({
      next: (data) => {
        this.advisorySummary.set(data);
        this.loadingReports.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar reportes de asesorías');
        this.loadingReports.set(false);
      },
    });

    this.reportService.projectSummary().subscribe({
      next: (data) => this.projectSummary.set(data),
      error: () => this.toast.error('No se pudieron cargar reportes de proyectos'),
    });
  }

  downloadAdvisoryPdf() {
    const filters = {
      from: this.reportFrom() || undefined,
      to: this.reportTo() || undefined,
      status: this.reportStatus() || undefined,
    };
    this.reportService.advisoryPdf(filters).subscribe({
      next: (blob) => this.downloadBlob(blob, 'advisories.pdf'),
      error: () => this.toast.error('No se pudo descargar PDF'),
    });
  }

  downloadProjectExcel() {
    this.reportService.projectExcel().subscribe({
      next: (blob) => this.downloadBlob(blob, 'projects.xlsx'),
      error: () => this.toast.error('No se pudo descargar Excel'),
    });
  }

  addUser() {
    const errors = this.validateCreateForm();
    if (Object.keys(errors).length) {
      this.toast.warning('Revisa los campos resaltados');
      return;
    }

    this.saving.set(true);
    this.userService.createUser(this.form()).subscribe({
      next: () => {
        this.form.set({ name: '', email: '', password: '', role: 'PROGRAMMER' });
        this.formErrors.set({});
        this.toast.success('Usuario creado correctamente');
        this.loadUsers();
        this.saving.set(false);
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'No se pudo crear el usuario');
        this.saving.set(false);
      },
    });
  }

  startEdit(u: UserProfile) {
    if (!u.id) return;
    this.editingId.set(u.id);
    this.editForm.set({
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role?.toUpperCase() as any) || 'USER',
    });
    this.validateEditForm();
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editErrors.set({});
    this.editForm.set({ id: undefined, name: '', email: '', role: 'USER' });
  }

  saveEdit() {
    const errors = this.validateEditForm();
    if (Object.keys(errors).length) {
      this.toast.warning('Revisa los campos resaltados');
      return;
    }
    const f = this.editForm();
    if (!f.id) return;

    this.saving.set(true);
    this.userService
      .updateUser(f.id, {
        name: f.name,
        email: f.email,
        role: f.role,
      })
      .subscribe({
        next: () => {
          this.toast.success('Usuario actualizado');
          this.cancelEdit();
          this.loadUsers();
          this.saving.set(false);
        },
        error: (e) => {
          this.toast.error(e?.error?.error || 'No se pudo actualizar el usuario');
          this.saving.set(false);
        },
      });
  }

  deleteUser(u: UserProfile) {
    if (!u.id) return;
    if (!confirm(`Eliminar a ${u.name}?`)) return;

    this.saving.set(true);
    this.userService.deleteUser(u.id).subscribe({
      next: () => {
        this.toast.success('Usuario eliminado');
        this.loadUsers();
        this.saving.set(false);
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'No se pudo eliminar el usuario');
        this.saving.set(false);
      },
    });
  }

  advisoryTotal(status: string) {
    return this.advisorySummary()
      .filter(i => i.status === status)
      .reduce((acc, i) => acc + i.total, 0);
  }

  advisoryTotalAll() {
    return this.advisorySummary().reduce((acc, i) => acc + i.total, 0);
  }

  advisoryPercent(status: string) {
    const total = this.advisoryTotalAll();
    if (!total) return 0;
    return Math.round((this.advisoryTotal(status) / total) * 100);
  }

  validateCreateForm() {
    const data = this.form();
    const errors: any = {};
    if (!data.name || data.name.trim().length < 2) errors.name = 'Nombre requerido';
    if (!data.email) errors.email = 'Email requerido';
    if (data.email && !this.isValidEmail(data.email)) errors.email = 'Email inválido';
    if (!data.password) errors.password = 'Password requerido';
    if (data.password && data.password.length < 6) errors.password = 'Mínimo 6 caracteres';

    this.formErrors.set(errors);
    return errors;
  }

  validateEditForm() {
    const f = this.editForm();
    const errors: any = {};
    if (!f.name || f.name.trim().length < 2) errors.name = 'Nombre requerido';
    if (!f.email) errors.email = 'Email requerido';
    if (f.email && !this.isValidEmail(f.email)) errors.email = 'Email inválido';

    this.editErrors.set(errors);
    return errors;
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
