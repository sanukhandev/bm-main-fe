import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'bm-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen w-full bg-[#132a13] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <!-- Subtle Background Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#31572c]/30 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#4f772d]/25 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[540px] z-10 border border-[#31572c]/30">
        
        <!-- Left Branding Panel -->
        <div class="bm-gradient-card p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div class="z-10">
            <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-[#ecf39e] text-xl mb-8 shadow-inner">
              BM
            </div>
            <h1 class="text-3xl font-semibold text-white tracking-tight leading-snug mb-3">
              Baithul Madeena
            </h1>
            <p class="text-[#d0e6cd] text-sm font-light leading-relaxed">
              Multi-branch real estate ERP workspace with precise asset leasing, traceability, and operations.
            </p>
          </div>

          <div class="z-10 text-xs text-[#a0cc9b] font-medium">
            &copy; 2026 Baithul Madeena Real Estate. All rights reserved.
          </div>

          <!-- Subtle Background CSS Glow Shapes -->
          <div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#4f772d]/20 blur-2xl pointer-events-none"></div>
          <div class="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#ecf39e]/15 blur-2xl pointer-events-none"></div>
        </div>

        <!-- Right Login Form Panel -->
        <div class="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-[#0b190b] tracking-tight">Sign In</h2>
            <p class="text-xs text-[#576633] mt-1">Access your operational branch context</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                formControlName="email"
                placeholder="name@company.com"
                class="bm-input"
                [class.border-rose-300]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Valid email is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••••"
                class="bm-input"
                [class.border-rose-300]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Password is required</span>
              }
            </div>

            <button
              type="submit"
              [disabled]="isSubmitting()"
              class="bm-btn bm-btn-primary w-full mt-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Sign In to ERP
            </button>
          </form>
        </div>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService
      .login({ email: email!, password: password! })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.message || 'Invalid email or password. Please check your credentials.'
          );
        },
      });
  }
}
