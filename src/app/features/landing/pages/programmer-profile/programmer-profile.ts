import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgrammerService } from '../../../../core/services/programmer.service';
import { UserService } from '../../../../core/services/user.service';
import { catchError, of } from 'rxjs';
import { Drawer } from '../../../auth/components/drawer/drawer';
import type { AvailabilitySlot, ProgrammerProfile, Project } from '../../../../models';

@Component({
  selector: 'app-programmer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, Drawer],
  templateUrl: './programmer-profile.html',
})
export class ProgrammerProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private programmerService = inject(ProgrammerService);
  private userService = inject(UserService);

  profile = signal<ProgrammerProfile | null>(null);
  projects = signal<Project[]>([]);
  availability = signal<AvailabilitySlot[]>([]);
  loading = signal(true);
  error = signal('');

  canSchedule() {
    const role = this.userService.userProfile()?.role;
    return !role || role === 'user';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set('Perfil inválido.');
        this.loading.set(false);
        return;
      }

      this.programmerService.getProgrammerPublic(id).subscribe({
        next: p => {
          this.profile.set(p);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el perfil.');
          this.loading.set(false);
        },
      });

      this.programmerService.listProjectsPublic(id)
        .pipe(catchError(() => of([] as Project[])))
        .subscribe(list => this.projects.set(list));

      this.programmerService.listAvailabilityPublic(id)
        .pipe(catchError(() => of([] as AvailabilitySlot[])))
        .subscribe(list => this.availability.set(list));
    });
  }

  openWhatsApp(phoneNumber: string) {
    const user = this.userService.userProfile();
    const userName = user?.name || 'Un usuario';
    const message = `Hola, soy ${userName} y me gustaría contactarte para una asesoría.`;
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
  }

  openEmail(email: string) {
    const user = this.userService.userProfile();
    const userName = user?.name || 'Un usuario';
    const subject = 'Solicitud de asesoría';
    const body = `Hola,\n\nSoy ${userName} y me gustaría contactarte para una asesoría.\n\nSaludos.`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  getSocialIcon(name: string): string {
    const icons: Record<string, string> = {
      instagram: '📷',
      linkedin: '💼',
      github: '🐙',
      twitter: '🐦',
      facebook: '👥',
      tiktok: '🎵',
    };
    return icons[name] || '🔗';
  }
}
