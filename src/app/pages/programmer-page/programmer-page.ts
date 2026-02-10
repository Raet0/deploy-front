import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from '../../features/auth/components/drawer/drawer';
import { ProgrammerService } from '../../core/services/programmer.service';
import { ToastService } from '../../core/ui/toast.service';
import { environment } from '../../../environments/environments';
import type {
  Advisory,
  AvailabilityRequest,
  AvailabilitySlot,
  ProgrammerProfile,
  Project,
  ProjectSection,
  Participation,
} from '../../models';

interface SocialLink {
  name: string;
  url: string;
}

interface ProjectForm {
  id?: number;
  name: string;
  description: string;
  participation: Participation;
  section: ProjectSection;
  technologies: string[];
  imageUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  active: boolean;
}

type AvailabilityForm = AvailabilityRequest & { id?: number };

interface ProfileForm {
  specialty: string;
  description: string;
  skills: string[];
  photoUrl: string;
  socials: SocialLink[];
}

@Component({
  selector: 'app-programmer-page',
  standalone: true,
  imports: [Drawer, CommonModule, FormsModule],
  templateUrl: './programmer-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammerPage implements OnInit {
  private programmerService = inject(ProgrammerService);
  private toast = inject(ToastService);

  readonly weekdays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as const;
  readonly modalities = ['PRESENCIAL','VIRTUAL'] as const;
  readonly participations = ['FRONTEND','BACKEND','DATABASE','FULLSTACK'] as const;
  readonly sections = ['ACADEMICO','LABORAL'] as const;

  profileId = signal<number | null>(null);
  profileForm = signal<ProfileForm>({
    specialty: '',
    description: '',
    skills: [],
    photoUrl: '',
    socials: [],
  });

  profileErrors = signal<{ specialty?: string; description?: string }>({});
  projectErrors = signal<{ name?: string; description?: string; participation?: string; section?: string; technologies?: string }>({});
  availabilityErrors = signal<{ day?: string; startTime?: string; endTime?: string; modality?: string }>({});

  loadingProfile = signal(false);
  savingProfile = signal(false);
  uploadingProfilePhoto = signal(false);

  newSkill = signal('');
  newTech = signal('');

  projects = signal<Project[]>([]);
  projectForm = signal<ProjectForm>({
    name: '',
    description: '',
    participation: 'FRONTEND',
    section: 'ACADEMICO',
    technologies: [],
    imageUrl: '',
    repoUrl: '',
    demoUrl: '',
    active: true,
  });
  editingProjectId = signal<number | null>(null);
  loadingProjects = signal(false);
  savingProject = signal(false);
  uploadingProjectImage = signal(false);

  advisories = signal<Advisory[]>([]);
  loadingAdvisories = signal(false);
  selectedAdvisory = signal<Advisory | null>(null);
  advisoryResponse = signal('');

  availabilities = signal<AvailabilitySlot[]>([]);
  availabilityForm = signal<AvailabilityForm>({
    day: 'MONDAY',
    startTime: '',
    endTime: '',
    modality: 'PRESENCIAL',
  });
  loadingAvailability = signal(false);
  savingAvailability = signal(false);

  ngOnInit(): void {
    this.loadProfile();
    this.loadProjects();
    this.loadAvailabilities();
    this.loadAdvisories();
  }

  loadProfile() {
    this.loadingProfile.set(true);
    this.programmerService.getMyProfile().subscribe({
      next: (p: ProgrammerProfile) => {
        this.profileForm.set({
          specialty: p.specialty || '',
          description: p.description || '',
          skills: p.skills || [],
          photoUrl: p.photoUrl || '',
          socials: p.socials || [],
        });
        this.profileId.set(p.id);
        this.loadingProfile.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar el perfil');
        this.loadingProfile.set(false);
      },
    });
  }

  saveProfile() {
    const form = this.profileForm();
    const errors: any = {};
    if (!form.specialty) errors.specialty = 'Especialidad requerida';
    if (!form.description) errors.description = 'Descripción requerida';
    this.profileErrors.set(errors);
    if (Object.keys(errors).length) {
      this.toast.warning('Completa los campos requeridos');
      return;
    }

    this.savingProfile.set(true);
    this.programmerService.updateMyProfile(form).subscribe({
      next: () => {
        this.toast.success('Perfil actualizado');
        this.savingProfile.set(false);
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'Error al actualizar perfil');
        this.savingProfile.set(false);
      },
    });
  }

  addSkill() {
    const skill = this.newSkill().trim();
    if (!skill) {
      this.toast.warning('Escribe una habilidad');
      return;
    }
    const current = this.profileForm();
    current.skills.push(skill);
    this.profileForm.set({ ...current });
    this.newSkill.set('');
  }

  removeSkill(index: number) {
    const current = this.profileForm();
    current.skills.splice(index, 1);
    this.profileForm.set({ ...current });
  }

  addSocial() {
    const current = this.profileForm();
    current.socials.push({ name: '', url: '' });
    this.profileForm.set({ ...current });
  }

  removeSocial(index: number) {
    const current = this.profileForm();
    current.socials.splice(index, 1);
    this.profileForm.set({ ...current });
  }

  getPlaceholderForSocial(type: string): string {
    const placeholders: Record<string, string> = {
      whatsapp: '+593999999999',
      email: 'tu@email.com',
      instagram: 'https://instagram.com/usuario',
      linkedin: 'https://linkedin.com/in/usuario',
      github: 'https://github.com/usuario',
      twitter: 'https://twitter.com/usuario',
      facebook: 'https://facebook.com/usuario',
      tiktok: 'https://tiktok.com/@usuario',
    };
    return placeholders[type] || 'URL o valor';
  }

  async onProfilePhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const url = await this.uploadImage(input.files[0], 'profile');
    if (url) {
      this.profileForm.update(f => ({ ...f, photoUrl: url }));
    }
  }

  async onProjectImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const url = await this.uploadImage(input.files[0], 'project');
    if (url) {
      this.projectForm.update(f => ({ ...f, imageUrl: url }));
    }
  }

  private async uploadImage(file: File, type: 'profile' | 'project'): Promise<string | null> {
    if (!environment.cloudinaryCloudName || !environment.cloudinaryUploadPreset) {
      this.toast.error('Configura Cloudinary en environments');
      return null;
    }

    if (type === 'profile') this.uploadingProfilePhoto.set(true);
    else this.uploadingProjectImage.set(true);

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
        this.toast.success('Imagen subida');
        return data.secure_url;
      }
      this.toast.error('Error subiendo imagen');
      return null;
    } catch {
      this.toast.error('Error subiendo imagen');
      return null;
    } finally {
      if (type === 'profile') this.uploadingProfilePhoto.set(false);
      else this.uploadingProjectImage.set(false);
    }
  }

  loadProjects() {
    this.loadingProjects.set(true);
    this.programmerService.listProjects().subscribe({
      next: (list: Project[]) => {
        this.projects.set(list);
        this.loadingProjects.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar proyectos');
        this.loadingProjects.set(false);
      },
    });
  }

  saveProject() {
    const form = this.projectForm();
    const errors: any = {};
    if (!form.name) errors.name = 'Nombre requerido';
    if (!form.description) errors.description = 'Descripción requerida';
    if (!form.participation) errors.participation = 'Participación requerida';
    if (!form.section) errors.section = 'Sección requerida';
    if (!form.technologies.length) errors.technologies = 'Tecnologías requeridas';
    this.projectErrors.set(errors);

    if (Object.keys(errors).length) {
      this.toast.warning('Completa los campos del proyecto');
      return;
    }

    const editingId = this.editingProjectId();
    this.savingProject.set(true);

    if (editingId) {
      this.programmerService.updateProject(editingId, form).subscribe({
        next: () => {
          this.toast.success('Proyecto actualizado');
          this.resetProjectForm();
          this.loadProjects();
          this.savingProject.set(false);
        },
        error: (e) => {
          this.toast.error(e?.error?.error || 'Error al actualizar proyecto');
          this.savingProject.set(false);
        },
      });
    } else {
      this.programmerService.createProject(form).subscribe({
        next: () => {
          this.toast.success('Proyecto creado');
          this.resetProjectForm();
          this.loadProjects();
          this.savingProject.set(false);
        },
        error: (e) => {
          this.toast.error(e?.error?.error || 'Error al crear proyecto');
          this.savingProject.set(false);
        },
      });
    }
  }

  editProject(project: Project) {
    this.projectForm.set({
      id: project.id,
      name: project.name,
      description: project.description,
      participation: project.participation,
      section: project.section,
      technologies: project.technologies || [],
      imageUrl: project.imageUrl || '',
      repoUrl: project.repoUrl || '',
      demoUrl: project.demoUrl || '',
      active: project.active ?? true,
    });
    this.editingProjectId.set(project.id || null);
  }

  deleteProject(id: number) {
    if (!confirm('¿Eliminar proyecto?')) return;
    this.programmerService.deleteProject(id).subscribe({
      next: () => {
        this.toast.success('Proyecto eliminado');
        this.loadProjects();
      },
      error: () => this.toast.error('Error al eliminar proyecto'),
    });
  }

  resetProjectForm() {
    this.projectForm.set({
      name: '',
      description: '',
      participation: 'FRONTEND',
      section: 'ACADEMICO',
      technologies: [],
      imageUrl: '',
      repoUrl: '',
      demoUrl: '',
      active: true,
    });
    this.editingProjectId.set(null);
    this.newTech.set('');
    this.projectErrors.set({});
  }

  addTechnology() {
    const tech = this.newTech().trim();
    if (!tech) {
      this.toast.warning('Escribe una tecnología');
      return;
    }
    const current = this.projectForm();
    current.technologies.push(tech);
    this.projectForm.set({ ...current });
    this.newTech.set('');
  }

  removeTechnology(index: number) {
    const current = this.projectForm();
    current.technologies.splice(index, 1);
    this.projectForm.set({ ...current });
  }

  loadAvailabilities() {
    this.loadingAvailability.set(true);
    this.programmerService.listAvailability().subscribe({
      next: (list: AvailabilitySlot[]) => {
        this.availabilities.set(list);
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar disponibilidad');
        this.loadingAvailability.set(false);
      },
    });
  }

  saveAvailability() {
    const form = this.availabilityForm();
    const errors: any = {};
    if (!form.day) errors.day = 'Día requerido';
    if (!form.startTime) errors.startTime = 'Hora inicio requerida';
    if (!form.endTime) errors.endTime = 'Hora fin requerida';
    if (!form.modality) errors.modality = 'Modalidad requerida';
    this.availabilityErrors.set(errors);

    if (Object.keys(errors).length) {
      this.toast.warning('Completa la disponibilidad');
      return;
    }

    if (form.startTime >= form.endTime) {
      this.toast.warning('La hora de inicio debe ser menor a la de fin');
      return;
    }

    this.savingAvailability.set(true);
    this.programmerService.addAvailability(form).subscribe({
      next: () => {
        this.toast.success('Disponibilidad agregada');
        this.resetAvailabilityForm();
        this.loadAvailabilities();
        this.savingAvailability.set(false);
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'Error al agregar disponibilidad');
        this.savingAvailability.set(false);
      },
    });
  }

  deleteAvailability(id: number) {
    if (!confirm('¿Eliminar disponibilidad?')) return;
    this.programmerService.deleteAvailability(id).subscribe({
      next: () => {
        this.toast.success('Disponibilidad eliminada');
        this.loadAvailabilities();
      },
      error: () => this.toast.error('Error al eliminar'),
    });
  }

  resetAvailabilityForm() {
    this.availabilityForm.set({
      day: 'MONDAY',
      startTime: '',
      endTime: '',
      modality: 'PRESENCIAL',
    });
    this.availabilityErrors.set({});
  }

  loadAdvisories() {
    this.loadingAdvisories.set(true);
    this.programmerService.listAdvisories().subscribe({
      next: (list) => {
        this.advisories.set(list);
        this.loadingAdvisories.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar asesorías');
        this.loadingAdvisories.set(false);
      },
    });
  }

  selectAdvisory(a: Advisory) {
    this.selectedAdvisory.set(a);
    this.advisoryResponse.set('');
  }

  approveAdvisory(a: Advisory) {
    this.programmerService.updateAdvisoryStatus(a.id as number, 'APROBADA', this.advisoryResponse()).subscribe({
      next: () => {
        this.toast.success('Asesoría aprobada');
        this.selectedAdvisory.set(null);
        this.loadAdvisories();
      },
      error: (e) => this.toast.error(e?.error?.error || 'No se pudo aprobar'),
    });
  }

  rejectAdvisory(a: Advisory) {
    this.programmerService.updateAdvisoryStatus(a.id as number, 'RECHAZADA', this.advisoryResponse()).subscribe({
      next: () => {
        this.toast.success('Asesoría rechazada');
        this.selectedAdvisory.set(null);
        this.loadAdvisories();
      },
      error: (e) => this.toast.error(e?.error?.error || 'No se pudo rechazar'),
    });
  }

  advisoryCount(status: string) {
    return this.advisories().filter(a => a.status === status).length;
  }
}
