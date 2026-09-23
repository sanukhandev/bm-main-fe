import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

import { BmFooterComponent } from '../../shared/components/bm-footer/bm-footer.component';

@Component({
  selector: 'bm-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BmFooterComponent],
  template: `
    <div
      class="min-h-dvh min-h-screen w-full bg-[#193D32] bg-[radial-gradient(circle_at_85%_85%,rgba(156,175,159,0.15),transparent_40%)] flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans"
    >
      <!-- Background Ambient Accents -->
      <div
        class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#9CAF9F]/10 blur-3xl pointer-events-none"
      ></div>
      <div
        class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#143229]/40 blur-3xl pointer-events-none"
      ></div>

      <!-- Main Login Container Panel -->
      <div
        class="max-w-[1120px] w-full min-h-[660px] bg-[#FBFAF7] rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] z-10"
      >
        <!-- Left Branding Panel (Desktop & Tablet) -->
        <div
          class="hidden lg:flex p-10 xl:p-14 flex-col justify-between relative overflow-hidden bg-[linear-gradient(145deg,#193D32_0%,#143229_45%,#0F2720_100%)] text-white select-none"
        >
          <!-- Faint Structural Grid Overlay & Radial Highlight -->
          <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(156,175,159,0.2),transparent_50%)] pointer-events-none"
          ></div>
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
          ></div>

          <!-- Top Brand Monogram -->
          <div class="z-10 flex items-center gap-3.5">
            <div
              class="w-10 h-10 rounded-lg bg-[#FBFAF7] text-[#193D32] flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shrink-0"
            >
              BM
            </div>
            <div>
              <div class="font-bold text-white text-base tracking-tight leading-tight">
                Baithul Madeena
              </div>
              <div class="text-[10px] text-[#9CAF9F] font-semibold uppercase tracking-widest mt-0.5">
                Real Estate ERP
              </div>
            </div>
          </div>

          <!-- Middle Value Proposition -->
          <div class="z-10 my-auto py-8">
            <h1
              class="text-[32px] leading-[1.2] font-semibold text-white tracking-tight mb-4"
            >
              Multi-branch real estate operations.
            </h1>
            <p
              class="text-[#9CAF9F]/90 text-sm leading-relaxed max-w-[380px] font-normal"
            >
              Manage properties, agreements, customers, and financial operations with secure verified branch-level isolation.
            </p>

            <!-- Subtle Feature Tags -->
            <div class="mt-8 flex flex-wrap gap-2.5">
              <span
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white backdrop-blur-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[#9CAF9F]"></span>
                Multi-branch Isolation
              </span>
              <span
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white backdrop-blur-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[#9CAF9F]"></span>
                Secure ERP Workspace
              </span>
            </div>
          </div>

          <!-- Bottom Footer Info -->
          <div
            class="z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#9CAF9F]/80 font-medium"
          >
            <span>&copy; 2026 Baithul Madeena Real Estate</span>
            <span>Enterprise v2.4</span>
          </div>
        </div>

        <!-- Right Form Panel -->
        <div class="p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-[#FBFAF7] relative">
          <!-- Mobile Top Header Badge (Shown on small screens) -->
          <div class="lg:hidden flex items-center gap-3 mb-8 pb-6 border-b border-[#E5E0D8]">
            <div
              class="w-10 h-10 rounded-lg bg-[#193D32] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
            >
              BM
            </div>
            <div>
              <div class="font-semibold text-[#1B1E1C] text-sm">Baithul Madeena</div>
              <div class="text-[10px] text-[#193D32] font-semibold uppercase tracking-wider">Real Estate ERP</div>
            </div>
          </div>

          <!-- Form Inner Wrapper -->
          <div class="max-w-[400px] w-full mx-auto">
            <!-- Header Block -->
            <div class="mb-8">
              <h2
                class="text-[28px] font-semibold text-[#1B1E1C] tracking-tight leading-tight"
              >
                Sign In
              </h2>
              <p class="text-xs text-[#1B1E1C]/60 mt-1.5 font-normal">
                Access your Baithul Madeena workspace.
              </p>
            </div>

            <!-- Inline Auth Error Banner -->
            @if (errorMessage()) {
              <div
                role="alert"
                aria-live="assertive"
                class="mb-6 p-4 rounded-xl bg-[#B98D91]/15 border border-[#B98D91]/40 text-xs text-[#1B1E1C] flex items-start gap-3 animate-fade-in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-[#B98D91] shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <div class="font-semibold text-[#1B1E1C] mb-0.5">
                    Unable to sign in
                  </div>
                  <div class="text-[#1B1E1C]/80 leading-relaxed">
                    {{ errorMessage() }}
                  </div>
                </div>
              </div>
            }

            <!-- Form Body -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email Input Field Group -->
              <div>
                <label
                  for="email-input"
                  class="block text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/70 mb-2"
                >
                  Email Address
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1B1E1C]/40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    formControlName="email"
                    placeholder="name@company.com"
                    autocomplete="email"
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('email')"
                    [attr.aria-describedby]="isFieldInvalid('email') ? 'email-error' : null"
                    class="w-full h-11 pl-10 pr-4 rounded-lg bg-[#F2EFE9]/40 border border-[#E5E0D8] text-xs text-[#1B1E1C] placeholder:text-[#1B1E1C]/40 transition-all focus:bg-white focus:border-[#193D32] focus:ring-2 focus:ring-[#193D32]/10 focus:outline-none"
                    [class.border-[#B98D91]]="isFieldInvalid('email')"
                  />
                </div>
                @if (isFieldInvalid('email')) {
                  <span
                    id="email-error"
                    class="text-[11px] font-medium text-[#B98D91] mt-1.5 block flex items-center gap-1"
                  >
                    Please enter a valid email address.
                  </span>
                }
              </div>

              <!-- Password Input Field Group -->
              <div>
                <label
                  for="password-input"
                  class="block text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/70 mb-2"
                >
                  Password
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1B1E1C]/40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password-input"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('password')"
                    [attr.aria-describedby]="isFieldInvalid('password') ? 'password-error' : null"
                    class="w-full h-11 pl-10 pr-10 rounded-lg bg-[#F2EFE9]/40 border border-[#E5E0D8] text-xs text-[#1B1E1C] placeholder:text-[#1B1E1C]/40 transition-all focus:bg-white focus:border-[#193D32] focus:ring-2 focus:ring-[#193D32]/10 focus:outline-none"
                    [class.border-[#B98D91]]="isFieldInvalid('password')"
                  />

                  <!-- Password Show/Hide Toggle Button -->
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    aria-label="Toggle password visibility"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1B1E1C]/40 hover:text-[#1B1E1C] focus:outline-none transition-colors"
                  >
                    @if (showPassword()) {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.75"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.124 10.124 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                        />
                      </svg>
                    } @else {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.75"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.75"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    }
                  </button>
                </div>
                @if (isFieldInvalid('password')) {
                  <span
                    id="password-error"
                    class="text-[11px] font-medium text-[#B98D91] mt-1.5 block flex items-center gap-1"
                  >
                    Please enter your password.
                  </span>
                }
              </div>

              <!-- Primary Submit Button -->
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="w-full h-11 rounded-lg bg-[#193D32] hover:bg-[#143229] active:scale-[0.99] font-semibold text-xs text-white shadow-sm focus:ring-2 focus:ring-[#193D32]/20 focus:outline-none transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed mt-6"
              >
                @if (isSubmitting()) {
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Securing connection to <span class="font-zaakiy font-bold">ZaakiyV3RSE</span>...</span>
                } @else {
                  <span>Sign In</span>
                }
              </button>
            </form>

            <!-- Bottom Security Note -->
            <div
              class="mt-8 pt-6 border-t border-[#E5E0D8] flex items-center justify-center gap-2 text-xs text-[#1B1E1C]/50 font-medium select-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-[#193D32]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Encrypted & secure branch workspace</span>
            </div>

            <!-- Application Common Footer -->
            <div class="mt-4 pt-4 border-t border-[#E5E0D8]">
              <bm-footer></bm-footer>
            </div>
          </div>
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
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
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

