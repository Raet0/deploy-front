import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from "../../components/drawer/drawer";
import { ToastService } from '../../../../core/ui/toast.service';
import { UserService, UserProfile } from '../../../../core/services/user.service';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer],
  templateUrl: './user-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfilePage implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  profile = signal<UserProfile | null>(null);
  editing = signal(false);
  saving = signal(false);
  uploading = signal(false);

  form = signal({
    name: '',
    headline: '',
    bio: '',
    photoUrl: '',
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getMyProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.form.set({
          name: p.name || '',
          headline: p.headline || '',
          bio: p.bio || '',
          photoUrl: p.photoUrl || '',
        });
      },
      error: () => this.toast.error('No se pudo cargar el perfil'),
    });
  }

  roleLabel(role?: string) {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'programmer': return 'Programador';
      default: return 'Usuario';
    }
  }

  roleBadge(role?: string) {
    switch (role) {
      case 'admin': return 'badge-primary';
      case 'programmer': return 'badge-secondary';
      default: return 'badge-outline';
    }
  }

  formatDate(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(date);
  }

  toggleEdit() {
    this.editing.set(!this.editing());
  }

  saveProfile() {
    const f = this.form();
    if (!f.name) {
      this.toast.warning('El nombre es obligatorio');
      return;
    }

    this.saving.set(true);
    this.userService.updateMyProfile({
      name: f.name,
      headline: f.headline,
      bio: f.bio,
      photoUrl: f.photoUrl,
    }).subscribe({
      next: p => {
        this.profile.set(p);
        this.toast.success('Perfil actualizado');
        this.saving.set(false);
        this.editing.set(false);
      },
      error: e => {
        this.toast.error(e?.error?.error || 'No se pudo actualizar');
        this.saving.set(false);
      },
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!environment.cloudinaryCloudName || !environment.cloudinaryUploadPreset) {
      this.toast.error('Configura Cloudinary en environments');
      return;
    }

    this.uploading.set(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinaryUploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data?.secure_url) {
        this.form.update(f => ({ ...f, photoUrl: data.secure_url }));
        this.toast.success('Foto subida');
      } else {
        this.toast.error('Error subiendo foto');
      }
    } catch {
      this.toast.error('Error subiendo foto');
    } finally {
      this.uploading.set(false);
    }
  }

  copyProfile() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => this.toast.success('Perfil copiado'))
      .catch(() => this.toast.warning('No se pudo copiar'));
  }
}
