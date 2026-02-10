import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';
import { ToastComponent } from './core/ui/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);

  protected readonly title = signal('TrabajoInterciclo-PortafolioWebCompartido');
  isInitialized = signal(false);

  async ngOnInit() {
    await this.auth.waitForAuth();
    this.userService.userProfile();
    this.isInitialized.set(true);
  }
}
