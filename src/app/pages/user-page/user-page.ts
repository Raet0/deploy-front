import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { ProgrammerProfile, Advisory, AvailabilitySlot } from '../../models';
import { ProgrammerService } from '../../core/services/programmer.service';
import { ToastService } from '../../core/ui/toast.service';
import { Drawer } from '../../features/auth/components/drawer/drawer';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Drawer],
  templateUrl: './user-page.html',
})
export class UserPageComponent implements OnInit {
  private programmerService = inject(ProgrammerService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  programmers = signal<ProgrammerProfile[]>([]);
  selectedProgrammer = signal<ProgrammerProfile | null>(null);
  availability = signal<AvailabilitySlot[]>([]);
  advisoryForm = signal<Partial<Advisory>>({});
  myAdvisories = signal<Advisory[]>([]);

  sending = signal(false);
  loadingAdvisories = signal(false);
  loadingProgrammers = signal(false);
  loadingAvailability = signal(false);

  touched = signal({
    programmer: false,
    name: false,
    email: false,
    date: false,
  });

  get currentEmail(): string | undefined {
    return this.auth.currentUser()?.email;
  }

  ngOnInit() {
    this.loadProgrammers();
    this.route.queryParamMap.subscribe(params => {
      const id = Number(params.get('programmerId'));
      if (id) this.selectProgrammer(id);
    });

    if (this.currentEmail) {
      this.advisoryForm.update(f => ({ ...f, requesterEmail: this.currentEmail }));
      this.loadMyAdvisories();
    }
  }

  markTouched(field: keyof ReturnType<typeof this.touched>) {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  loadProgrammers() {
    this.loadingProgrammers.set(true);
    this.programmerService.listProgrammersPublic().subscribe({
      next: list => {
        this.programmers.set(list);
        this.loadingProgrammers.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar programadores');
        this.loadingProgrammers.set(false);
      },
    });
  }

  onProgrammerChange(id?: number | null) {
    if (!id) {
      this.clearSelection();
      return;
    }
    this.selectProgrammer(id);
  }

  selectProgrammer(id: number) {
    const p = this.programmers().find(x => x.id === id) || null;
    this.selectedProgrammer.set(p);
    this.advisoryForm.update(f => ({ ...f, programmerProfileId: id }));

    this.loadingAvailability.set(true);
    this.programmerService.listAvailabilityPublic(id).subscribe({
      next: list => {
        this.availability.set(list);
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.availability.set([]);
        this.loadingAvailability.set(false);
      },
    });
  }

  clearSelection() {
    this.selectedProgrammer.set(null);
    this.availability.set([]);
    this.advisoryForm.update(f => ({ ...f, programmerProfileId: undefined }));
  }

  submit() {
    const f = this.advisoryForm();
    if (!f.programmerProfileId || !f.scheduledAt || !f.requesterEmail || !f.requesterName) {
      this.toast.warning('Completa programador, nombre, email y fecha');
      return;
    }

    if (!this.isValidEmail(f.requesterEmail)) {
      this.toast.warning('Email inválido');
      return;
    }

    if (!this.isFutureDate(f.scheduledAt)) {
      this.toast.warning('La fecha debe ser futura');
      return;
    }

    if (!this.isWithinAvailability(f.scheduledAt)) {
      this.toast.warning('La fecha no está dentro de la disponibilidad');
      return;
    }

    this.sending.set(true);
    this.programmerService
      .createAdvisory({
        programmerProfileId: f.programmerProfileId,
        requesterName: f.requesterName,
        requesterEmail: f.requesterEmail,
        scheduledAt: f.scheduledAt,
        comment: f.comment,
      })
      .subscribe({
        next: () => {
          this.toast.success('Solicitud enviada');
          this.loadMyAdvisories();
          this.advisoryForm.set({
            requesterEmail: f.requesterEmail,
            requesterName: f.requesterName,
          });
          this.clearSelection();
          this.sending.set(false);
        },
        error: e => {
          this.toast.error(e?.error?.error || 'No se pudo enviar');
          this.sending.set(false);
        },
      });
  }

  loadMyAdvisories() {
    const email = this.currentEmail || this.advisoryForm().requesterEmail;
    if (!email) {
      this.toast.warning('No hay email disponible');
      return;
    }

    this.loadingAdvisories.set(true);
    this.programmerService.listAdvisoriesByRequester(email).subscribe({
      next: list => {
        this.myAdvisories.set(list);
        this.loadingAdvisories.set(false);
        if (!list.length) this.toast.info('No hay solicitudes registradas');
      },
      error: () => {
        this.toast.error('No se pudieron cargar tus asesorías');
        this.loadingAdvisories.set(false);
      },
    });
  }

  countStatus(status: string) {
    return this.myAdvisories().filter(a => a.status === status).length;
  }

  isValidEmail(email?: string) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isFutureDate(raw: string) {
    const date = new Date(raw);
    return date.getTime() > Date.now();
  }

  private isWithinAvailability(raw: string) {
    const date = new Date(raw);
    if (isNaN(date.getTime()) || !this.availability().length) return true;

    const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const time = date.toTimeString().slice(0, 5);

    return this.availability().some(a =>
      a.day === day && time >= a.startTime && time <= a.endTime
    );
  }
}
