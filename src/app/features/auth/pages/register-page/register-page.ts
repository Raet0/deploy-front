import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Drawer } from "../../components/drawer/drawer";
import { Footer } from '../../../landing/components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, Drawer, CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator.bind(this) });

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.registerForm.value;
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    try {
      const user = await this.authService.registerAdmin(name, email, password).toPromise();
      if (!user) {
        this.errorMsg.set('Could not create admin');
        return;
      }
      this.successMsg.set('Admin created. Redirecting...');
      setTimeout(() => this.router.navigate(['/admin']), 1200);
    } catch (error: any) {
      const msg = error?.error?.error || 'Could not create admin';
      this.errorMsg.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility() { this.showPassword.set(!this.showPassword()); }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword.set(!this.showConfirmPassword()); }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loading = () => this.isLoading();
  errorMessage = () => this.errorMsg();
  successMessage = () => this.successMsg();
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
