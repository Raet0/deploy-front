import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgrammerService } from '../../../../core/services/programmer.service';
import type { ProgrammerProfile } from '../../../../models';

@Component({
  selector: 'app-profiles',
  imports: [CommonModule, RouterLink],
  templateUrl: './profiles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profiles implements OnInit {
  private programmerService = inject(ProgrammerService);

  profiles = signal<ProgrammerProfile[]>([]);
  loading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    this.programmerService.listProgrammersPublic().subscribe({
      next: list => {
        this.profiles.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los perfiles.');
        this.loading.set(false);
      },
    });
  }
}
