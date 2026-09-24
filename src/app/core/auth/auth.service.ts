import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, switchMap, finalize } from 'rxjs';
import { User, LoginCredentials } from './auth.models';
import { ApiResponse } from '../api/api.models';
import { BranchContextService } from '../branch-context/branch-context.service';
import { Branch } from '../branch-context/branch.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private branchContext = inject(BranchContextService);

  private currentUserSignal = signal<User | null>(null);
  private isInitializingSignal = signal<boolean>(true);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isInitializing = this.isInitializingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isSuperAdmin = computed(
    () => this.currentUserSignal()?.roles.includes('super_admin') ?? false,
  );
  readonly isBranchAdmin = computed(
    () => this.currentUserSignal()?.roles.includes('branch_admin') ?? false,
  );

  getCsrfCookie(): Observable<unknown> {
    return this.http.get('/sanctum/csrf-cookie', { withCredentials: true });
  }

  initializeAuth(): Observable<User | null> {
    this.isInitializingSignal.set(true);
    return this.loadCurrentUser().pipe(finalize(() => this.isInitializingSignal.set(false)));
  }

  loadCurrentUser(): Observable<User | null> {
    return this.http.get<ApiResponse<User>>('/api/v1/auth/me', { withCredentials: true }).pipe(
      map((res) => res.data),
      tap((user) => {
        this.currentUserSignal.set(user);
        this.branchContext.setAvailableBranches(user.branches || [], user.roles || []);
      }),
      catchError(() => {
        this.currentUserSignal.set(null);
        this.branchContext.clearContext();
        return of(null);
      }),
    );
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<ApiResponse<User>>('/api/v1/auth/login', credentials, {
          withCredentials: true,
        }),
      ),
      map((res) => res.data),
      tap((user) => {
        this.currentUserSignal.set(user);
        this.branchContext.setAvailableBranches(user.branches || [], user.roles || []);
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout', {}, { withCredentials: true }).pipe(
      catchError(() => of(undefined)),
      tap(() => {
        this.currentUserSignal.set(null);
        this.branchContext.clearContext();
        this.router.navigate(['/login']);
      }),
    );
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.roles.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    return this.currentUserSignal()?.permissions?.includes(permission) ?? this.isSuperAdmin();
  }
}
