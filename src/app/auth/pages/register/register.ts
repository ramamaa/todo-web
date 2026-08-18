import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AppHeader } from '../../../shared/components/app-header/app-header';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppHeader],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly registerForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.registerForm.getRawValue();

    this.authService.register(formValue).subscribe({
      next: () => {
        this.authService
          .login({
            email: formValue.email,
            password: formValue.password,
          })
          .subscribe({
            next: () => {
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              this.router.navigate(['/login']);
            },
          });
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message ?? 'Registration failed. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
