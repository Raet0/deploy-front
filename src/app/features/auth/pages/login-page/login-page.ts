import { Component, inject, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Drawer } from '../../components/drawer/drawer';
import { AuthService } from '../../../../core/services/auth.service';
import { GOOGLE_CLIENT_ID } from '../../../../core/services/api.config';

declare const google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Drawer, CommonModule],
  templateUrl: './login-page.html',
})
export class LoginPage implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('googleBtn', { static: true }) googleBtn!: ElementRef<HTMLDivElement>;

  loading = signal(false);
  errorMessage = signal<string>('');
  showPassword = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngAfterViewInit(): void {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'TU_GOOGLE_CLIENT_ID') {
      this.errorMessage.set('Configura GOOGLE_CLIENT_ID en api.config.ts');
      return;
    }
    if (typeof google === 'undefined') {
      this.errorMessage.set('Google SDK no cargado');
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp: any) => this.handleGoogle(resp),
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      theme: 'outline',
      size: 'large',
      width: 320,
    });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const user = await this.authService.login(email, password).toPromise();

      if (!user) {
        this.errorMessage.set('Unexpected error while signing in');
        return;
      }

      // ✅ CAMBIO: Todos van al home primero
      this.router.navigate(['/']);

    } catch (error: any) {
      const msg = error?.error?.error || 'Sign in failed';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  private async handleGoogle(resp: any) {
    if (!resp?.credential) {
      this.errorMessage.set('Google login failed');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    
    try {
      const user = await this.authService.loginWithGoogle(resp.credential).toPromise();
      
      if (!user) {
        this.errorMessage.set('Google login failed');
        return;
      }

      // ✅ CAMBIO: Todos van al home primero
      this.router.navigate(['/']);

    } catch (error: any) {
      this.errorMessage.set(error?.error?.error || 'Google login failed');
    } finally {
      this.loading.set(false);
    }
  }
}