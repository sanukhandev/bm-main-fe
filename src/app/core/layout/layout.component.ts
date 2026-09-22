import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BmBranchSwitcherComponent } from '../../shared/components/bm-branch-switcher/bm-branch-switcher.component';

@Component({
  selector: 'bm-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BmBranchSwitcherComponent],
  template: `
    <div class="min-h-screen p-3 md:p-6 bg-[#B7C4B9] flex flex-col justify-center">
      <!-- Main Application Container Frame -->
      <div class="max-w-[1720px] w-full mx-auto bg-[#F7F9F6] rounded-[24px] md:rounded-[28px] shadow-2xl overflow-hidden border border-white/40 flex flex-col md:flex-row min-h-[92vh]">
        
        <!-- Sidebar Navigation Rail -->
        <aside
          class="w-full md:w-64 bg-[#101214] text-white flex flex-col shrink-0 transition-all duration-300"
          [class.w-full]="mobileMenuOpen()"
        >
          <!-- Brand Header -->
          <div class="p-6 flex items-center justify-between border-b border-slate-800/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#10B981] flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-md">
                BM
              </div>
              <div>
                <div class="font-semibold text-white tracking-wide text-sm leading-tight">Baithul Madeena</div>
                <div class="text-[11px] text-emerald-400 font-medium tracking-wider uppercase">Real Estate ERP</div>
              </div>
            </div>

            <!-- Mobile Menu Toggle -->
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="md:hidden text-slate-400 hover:text-white p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav
            class="p-4 flex-1 space-y-1 overflow-y-auto"
            [class.hidden]="!mobileMenuOpen() && isMobile()"
            [class.block]="mobileMenuOpen() || !isMobile()"
          >
            <div class="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Operational Scope
            </div>

            <a
              routerLink="/app/dashboard"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </a>

            <a
              routerLink="/app/customers"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Customers</span>
            </a>

            <a
              routerLink="/app/properties"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties</span>
            </a>

            <div class="pt-4 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Leasing & Contracts
            </div>

            <a
              routerLink="/app/owner-agreements"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Owner Agreements</span>
            </a>

            <a
              routerLink="/app/tenant-agreements"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Tenant Agreements</span>
            </a>

            <!-- System Administration -->
            <div class="pt-4 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Administration
            </div>

            <a
              routerLink="/app/administration/branches"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Branches</span>
            </a>

            <a
              routerLink="/app/administration/users"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users</span>
            </a>

            <a
              routerLink="/app/administration/roles"
              routerLinkActive="bg-[#064E3B] text-white font-semibold border-l-4 border-[#DFFF62]"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Roles</span>
            </a>
          </nav>

          <!-- User Footer Info -->
          <div class="p-4 border-t border-slate-800/80 bg-[#0B0D0E]/50 flex items-center justify-between">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {{ userInitials() }}
              </div>
              <div class="overflow-hidden">
                <div class="text-xs font-medium text-white truncate">{{ user()?.name }}</div>
                <div class="text-[11px] text-slate-400 truncate capitalize">{{ primaryRole() }}</div>
              </div>
            </div>

            <button
              type="button"
              (click)="logout()"
              title="Logout"
              class="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </aside>

        <!-- Main Workspace Area -->
        <main class="flex-1 flex flex-col min-w-0 bg-[#F7F9F6]">
          <!-- Header Bar -->
          <header class="h-16 border-b border-[#DDE3DF] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div class="flex items-center gap-4">
              <h2 class="text-sm font-semibold text-[#101214]">Workspace</h2>
            </div>

            <div class="flex items-center gap-4">
              <bm-branch-switcher></bm-branch-switcher>
            </div>
          </header>

          <!-- Route Content Slot -->
          <div class="p-6 md:p-8 flex-1 overflow-y-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  mobileMenuOpen = signal(false);

  userInitials(): string {
    const name = this.user()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'BM';
  }

  primaryRole(): string {
    const roles = this.user()?.roles || [];
    if (roles.includes('super_admin')) return 'Super Admin';
    if (roles.includes('branch_admin')) return 'Branch Admin';
    return roles[0] || 'User';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
