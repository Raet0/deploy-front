import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'hero-pro',
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements OnInit {
  private auth = inject(AuthService);
  
  currentUser = signal(this.auth.currentUser());

  ngOnInit() {
    this.currentUser.set(this.auth.currentUser());
  }

  scrollToProfiles() {
    const profilesSection = document.getElementById('profiles');
    if (profilesSection) {
      profilesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getRoleLabel(role: string): string {
    if (role === 'admin') return 'Admin';
    if (role === 'programmer') return 'Programador';
    return 'Usuario';
  }
}