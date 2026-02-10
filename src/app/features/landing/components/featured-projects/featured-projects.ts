import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgrammerService } from '../../../../core/services/programmer.service';
import type { Project, ProgrammerProfile } from '../../../../models';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface FeaturedProject {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  section: string;
  participation: string;
  ownerName: string;
  profileId: number;
}

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProjects implements OnInit {
  private programmerService = inject(ProgrammerService);

  projects = signal<FeaturedProject[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.programmerService.listProgrammersPublic().subscribe({
      next: (profiles) => this.loadProjects(profiles),
      error: () => this.loading.set(false),
    });
  }

  private loadProjects(profiles: ProgrammerProfile[]) {
    if (!profiles.length) {
      this.loading.set(false);
      return;
    }

    const requests = profiles.map(p =>
      this.programmerService.listProjectsPublic(p.id).pipe(catchError(() => of([] as Project[])))
    );

    forkJoin(requests).subscribe({
      next: (lists) => {
        const flattened: FeaturedProject[] = lists.flatMap((list: Project[], index) => {
          const owner = profiles[index];
          return list.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            technologies: p.technologies,
            repoUrl: p.repoUrl,
            demoUrl: p.demoUrl,
            imageUrl: p.imageUrl,
            section: p.section,
            participation: p.participation,
            ownerName: owner.name,
            profileId: owner.id,
          }));
        });

        this.projects.set(flattened.slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
