import { Component, inject, signal, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BmLoadingService } from '../services/bm-loading.service';
import { BmBranchSwitcherComponent } from '../../shared/components/bm-branch-switcher/bm-branch-switcher.component';
import { BmFooterComponent } from '../../shared/components/bm-footer/bm-footer.component';

export type MegaMenuTab = 'operations' | 'agreements' | 'accounts' | 'reports' | 'admin' | null;

export interface PageSearchItem {
  title: string;
  subtitle?: string;
  category: 'Pages' | 'Actions' | 'Customers' | 'Properties' | 'Agreements' | 'Financials' | 'System';
  url: string;
  keywords: string[];
  badge?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'bm-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BmBranchSwitcherComponent, BmFooterComponent],
  template: `
    <div class="h-screen w-screen flex flex-col overflow-hidden bg-[#F8FAFC] relative font-sans text-[#0F172A] select-none">
      <!-- Global Top Loading Progress Bar -->
      @if (loadingService.isLoading()) {
        <div class="fixed top-0 left-0 right-0 z-50 h-1 bg-[#0F172A]/10 overflow-hidden">
          <div class="h-full bg-[#0F172A] animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.4)] w-full"></div>
        </div>
      }

      <!-- TOP NAVIGATION BAR (Desktop & Mobile Header) -->
      <header class="h-[70px] shrink-0 border-b border-[#E2E8F0] bg-white px-4 md:px-8 flex items-center justify-between z-30 relative shadow-2xs">
        <!-- LEFT: BRANDING MONOGRAM & TITLE -->
        <div class="flex items-center gap-6">
          <a routerLink="/app/dashboard" (click)="closeMegaMenu()" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform shrink-0">
              BM
            </div>
            <div class="hidden sm:block overflow-hidden whitespace-nowrap">
              <div class="font-bold text-[#0F172A] tracking-tight text-sm leading-tight">Baithul Madeena</div>
              <div class="text-[10px] text-[#64748B] font-semibold tracking-widest uppercase">Real Estate ERP</div>
            </div>
          </a>

          <!-- DESKTOP CENTER PRIMARY NAVIGATION LINKS -->
          <nav class="hidden lg:flex items-center gap-1.5 ml-4">
            <!-- Dashboard (Direct Link with Capsule Active State) -->
            <a
              routerLink="/app/dashboard"
              routerLinkActive="bg-[#0F172A] text-white font-semibold shadow-xs"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMegaMenu()"
              class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              Dashboard
            </a>

            <!-- Operations Mega Menu Trigger -->
            <button
              type="button"
              (click)="toggleMegaMenu('operations', $event)"
              [class.bg-[#0F172A]]="activeMegaMenu() === 'operations'"
              [class.text-white]="activeMegaMenu() === 'operations'"
              [class.font-semibold]="activeMegaMenu() === 'operations'"
              class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Operations</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="activeMegaMenu() === 'operations'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Agreements Mega Menu Trigger -->
            <button
              type="button"
              (click)="toggleMegaMenu('agreements', $event)"
              [class.bg-[#0F172A]]="activeMegaMenu() === 'agreements'"
              [class.text-white]="activeMegaMenu() === 'agreements'"
              [class.font-semibold]="activeMegaMenu() === 'agreements'"
              class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Agreements</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="activeMegaMenu() === 'agreements'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Accounts Mega Menu Trigger -->
            <button
              type="button"
              (click)="toggleMegaMenu('accounts', $event)"
              [class.bg-[#0F172A]]="activeMegaMenu() === 'accounts'"
              [class.text-white]="activeMegaMenu() === 'accounts'"
              [class.font-semibold]="activeMegaMenu() === 'accounts'"
              class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Accounts</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="activeMegaMenu() === 'accounts'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Reports Mega Menu Trigger -->
            <button
              type="button"
              (click)="toggleMegaMenu('reports', $event)"
              [class.bg-[#0F172A]]="activeMegaMenu() === 'reports'"
              [class.text-white]="activeMegaMenu() === 'reports'"
              [class.font-semibold]="activeMegaMenu() === 'reports'"
              class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Reports</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="activeMegaMenu() === 'reports'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Administration Mega Menu Trigger (Super Admin Only) -->
            @if (isSuperAdmin()) {
              <button
                type="button"
                (click)="toggleMegaMenu('admin', $event)"
                [class.bg-[#0F172A]]="activeMegaMenu() === 'admin'"
                [class.text-white]="activeMegaMenu() === 'admin'"
                [class.font-semibold]="activeMegaMenu() === 'admin'"
                class="h-[38px] px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Administration</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="activeMegaMenu() === 'admin'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
          </nav>

          <!-- GLOBAL NAV PAGE & ENTITY SEARCH BAR -->
          <div class="relative hidden sm:block w-44 md:w-60 lg:w-72 z-40 ml-2" (click)="$event.stopPropagation()">
            <div class="relative flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                #searchInput
                type="text"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (focus)="openSearch()"
                (keydown)="onSearchKeydown($event)"
                placeholder="Search pages, owners, properties... (/)"
                class="w-full h-9 pl-9 pr-9 rounded-full bg-slate-100/90 border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all shadow-2xs"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="absolute right-2.5 text-slate-400 hover:text-[#0F172A] text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  ✕
                </button>
              } @else {
                <kbd class="absolute right-2.5 text-[10px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white pointer-events-none shadow-2xs">
                  /
                </kbd>
              }
            </div>

            <!-- SEARCH RESULTS POPOVER DROPDOWN -->
            @if (isSearchOpen()) {
              <div class="absolute top-11 left-0 right-0 z-50 w-full sm:w-[360px] md:w-[420px] bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-2 max-h-[400px] overflow-y-auto animate-fade-in divide-y divide-slate-100">
                
                @if (filteredSearchResults().length > 0) {
                  <div class="py-1">
                    <div class="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex justify-between items-center">
                      <span>ERP Quick Jump ({{ filteredSearchResults().length }})</span>
                      <span class="text-[9px] font-normal text-slate-400">Press ↑↓ to navigate</span>
                    </div>

                    <div class="space-y-0.5">
                      @for (item of filteredSearchResults(); track item.url + item.title; let idx = $index) {
                        <button
                          type="button"
                          (click)="selectSearchResult(item)"
                          [class.bg-slate-100]="selectedIndex() === idx"
                          [class.border-slate-300]="selectedIndex() === idx"
                          class="w-full text-left p-2.5 rounded-xl hover:bg-slate-100/90 transition flex items-center justify-between group border border-transparent cursor-pointer"
                        >
                          <div class="flex items-center gap-2.5 min-w-0">
                            <!-- Category Badge -->
                            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                                 [class.bg-[#ECFDF5]]="item.category === 'Customers' || item.category === 'Pages'"
                                 [class.text-[#047857]]="item.category === 'Customers' || item.category === 'Pages'"
                                 [class.bg-[#EFF6FF]]="item.category === 'Properties'"
                                 [class.text-[#2563EB]]="item.category === 'Properties'"
                                 [class.bg-[#FFFBEB]]="item.category === 'Agreements' || item.category === 'Actions'"
                                 [class.text-[#D97706]]="item.category === 'Agreements' || item.category === 'Actions'"
                                 [class.bg-[#FEF2F2]]="item.category === 'Financials'"
                                 [class.text-[#DC2626]]="item.category === 'Financials'"
                                 [class.bg-slate-100]="item.category === 'System'"
                                 [class.text-slate-700]="item.category === 'System'">
                              @if (item.category === 'Customers') { 👤 }
                              @else if (item.category === 'Properties') { 🏢 }
                              @else if (item.category === 'Actions') { ⚡ }
                              @else if (item.category === 'Agreements') { 📄 }
                              @else if (item.category === 'Financials') { 💰 }
                              @else { ⚙️ }
                            </div>
                            <div class="min-w-0">
                              <div class="text-xs font-semibold text-[#0F172A] truncate group-hover:text-[#047857] flex items-center gap-1.5">
                                <span>{{ item.title }}</span>
                                @if (item.badge) {
                                  <span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-[#047857]">
                                    {{ item.badge }}
                                  </span>
                                }
                              </div>
                              @if (item.subtitle) {
                                <div class="text-[10px] text-[#64748B] truncate">{{ item.subtitle }}</div>
                              }
                            </div>
                          </div>

                          <div class="text-[10px] font-medium text-slate-400 group-hover:text-[#0F172A] shrink-0 pl-2">
                            →
                          </div>
                        </button>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="py-6 text-center">
                    <div class="text-xs text-[#64748B] font-medium">No results found for "{{ searchQuery() }}"</div>
                    <div class="text-[10px] text-slate-400 mt-1">Try "Owner", "Tenant", "Property", "Lease", "Inward", or "Receipt"</div>
                  </div>
                }

              </div>
            }
          </div>
        </div>

        <!-- RIGHT: BRANCH SELECTOR, NOTIFICATIONS, ZAAKIY, USER -->
        <div class="flex items-center gap-3">
          <!-- Branch Selector -->
          <bm-branch-switcher></bm-branch-switcher>

          <!-- Notification Bell Icon Button -->
          <button
            type="button"
            title="Notifications"
            class="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] hover:bg-slate-50 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <!-- Zaakiy AI Assistant Button -->
          <button
            type="button"
            title="Zaakiy AI Assistant"
            class="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5] transition text-xs font-semibold shrink-0 cursor-pointer border border-[#A7F3D0]/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Zaakiy</span>
          </button>

          <!-- User Avatar & Logout Cluster -->
          <div class="flex items-center gap-2.5 pl-1 border-l border-[#E2E8F0]">
            <div
              [title]="user()?.name || 'User'"
              class="w-9 h-9 rounded-full bg-[#0F172A] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs select-none"
            >
              {{ userInitials() }}
            </div>

            <div class="hidden xl:block text-left overflow-hidden whitespace-nowrap">
              <div class="text-xs font-semibold text-[#0F172A] truncate max-w-[110px]">{{ user()?.name }}</div>
              <div class="text-[10px] text-[#64748B] font-medium capitalize truncate">{{ primaryRole() }}</div>
            </div>

            <button
              type="button"
              (click)="logout()"
              title="Sign Out"
              class="text-[#64748B] hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition shrink-0 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Mobile Navigation Toggle Button (< 1024px) -->
          <button
            type="button"
            (click)="toggleMobileDrawer()"
            class="lg:hidden text-[#334155] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <!-- MEGA MENU POPOVER PANELS (Desktop floating below top nav) -->
      @if (activeMegaMenu()) {
        <!-- Backdrop Overlay to close mega menu -->
        <div class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]" (click)="closeMegaMenu()"></div>

        <div
          class="absolute top-[72px] left-1/2 -translate-x-1/2 z-50 w-[720px] max-w-[94vw] bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-6 transition-all duration-180 animate-fade-in"
          (click)="$event.stopPropagation()"
        >
          <!-- OPERATIONS MEGA MENU -->
          @if (activeMegaMenu() === 'operations') {
            <div class="grid grid-cols-3 gap-6">
              <!-- Customers Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">Customers</div>
                <div class="space-y-1">
                  <a routerLink="/app/customers/owners" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Owners</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Property owners & investors</div>
                    </div>
                  </a>
                  <a routerLink="/app/customers/tenants" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Tenants</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Active tenant directory</div>
                    </div>
                  </a>
                </div>

                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mt-5 mb-3">Portfolio</div>
                <div class="space-y-1">
                  <a routerLink="/app/properties" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">Properties</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Master real estate directory</div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Maintenance Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">Maintenance</div>
                <div class="space-y-1">
                  <a routerLink="/app/maintenance/work-orders" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">Work Orders</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Service requests & repairs</div>
                    </div>
                  </a>
                  <a routerLink="/app/maintenance/vendors" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">Vendors</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Approved contractors</div>
                    </div>
                  </a>
                  <a routerLink="/app/maintenance/inventory" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">Inventory</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Spare parts & stock</div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Billing Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">Billing</div>
                <div class="space-y-1">
                  <a routerLink="/app/billing/quotations" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h4m5 6H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">Quotations</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Price quotes & estimates</div>
                    </div>
                  </a>
                  <a routerLink="/app/billing/invoices" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                    <div class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">Invoices</div>
                      <div class="text-[10px] text-[#64748B] leading-tight">Receivable billing invoices</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- AGREEMENTS MEGA MENU -->
          @if (activeMegaMenu() === 'agreements') {
            <div class="grid grid-cols-2 gap-6">
              <a routerLink="/app/owner-agreements" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition border border-transparent hover:border-[#E2E8F0]">
                <div class="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#0F172A] group-hover:text-[#D97706]">Owner Agreements</div>
                  <div class="text-xs text-[#64748B] mt-0.5">Management agreements & terms with property owners</div>
                </div>
              </a>

              <a routerLink="/app/tenant-agreements" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition border border-transparent hover:border-[#E2E8F0]">
                <div class="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#0F172A] group-hover:text-[#047857]">Tenant Agreements</div>
                  <div class="text-xs text-[#64748B] mt-0.5">Leasing contracts & rent schedules with tenants</div>
                </div>
              </a>
            </div>
          }

          <!-- ACCOUNTS MEGA MENU -->
          @if (activeMegaMenu() === 'accounts') {
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-1">
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">Accounting Operations</div>
                <a routerLink="/app/accounts/dashboard" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Accounts Overview</div>
                    <div class="text-[10px] text-[#64748B]">Real-time balances & ledger</div>
                  </div>
                </a>

                <a routerLink="/app/accounts/inward" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3 3m0 0l3-3m-3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Inward Receipts</div>
                    <div class="text-[10px] text-[#64748B]">Collection vouchers & incoming money</div>
                  </div>
                </a>

                <a routerLink="/app/accounts/outward" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3-3m0 0l-3 3m3-3v6m0-13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">Outward Vouchers</div>
                    <div class="text-[10px] text-[#64748B]">Disbursements & payment vouchers</div>
                  </div>
                </a>
              </div>

              <div class="space-y-1">
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">Ledger & Cash Flow</div>
                <a routerLink="/app/accounts/petty-cash" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">Petty Cash Daybook</div>
                    <div class="text-[10px] text-[#64748B]">Daily petty cash transactions</div>
                  </div>
                </a>

                <a routerLink="/app/accounts/reports" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div class="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">Financial Reports</div>
                    <div class="text-[10px] text-[#64748B]">Income & expenditure statements</div>
                  </div>
                </a>
              </div>
            </div>
          }

          <!-- REPORTS MEGA MENU -->
          @if (activeMegaMenu() === 'reports') {
            <div class="grid grid-cols-2 gap-6">
              <a routerLink="/app/reports/owner-agreements" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition border border-transparent hover:border-[#E2E8F0]">
                <div class="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB]">Core Reports</div>
                  <div class="text-xs text-[#64748B] mt-0.5">Agreements, receivables, payables & cash</div>
                </div>
              </a>
            </div>
          }

          <!-- ADMINISTRATION MEGA MENU (Super Admin Only) -->
          @if (activeMegaMenu() === 'admin' && isSuperAdmin()) {
            <div class="grid grid-cols-3 gap-6">
              <a routerLink="/app/administration/branches" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition">
                <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Branches</div>
                  <div class="text-[10px] text-[#64748B]">Branch setup & scopes</div>
                </div>
              </a>

              <a routerLink="/app/administration/users" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition">
                <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Users</div>
                  <div class="text-[10px] text-[#64748B]">Manage user accounts</div>
                </div>
              </a>

              <a routerLink="/app/administration/roles" (click)="closeMegaMenu()" class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition">
                <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">Roles</div>
                  <div class="text-[10px] text-[#64748B]">Permissions & security</div>
                </div>
              </a>
            </div>
          }
        </div>
      }

      <!-- MOBILE / TABLET NAVIGATION DRAWER FALLBACK (< 1024px) -->
      @if (mobileDrawerOpen()) {
        <div class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden" (click)="closeMobileDrawer()"></div>

        <aside class="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white border-l border-[#E2E8F0] p-5 flex flex-col justify-between shadow-2xl lg:hidden animate-fade-in">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                  BM
                </div>
                <div class="font-bold text-sm text-[#0F172A]">Navigation</div>
              </div>
              <button type="button" (click)="closeMobileDrawer()" class="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav class="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
              <a routerLink="/app/dashboard" (click)="closeMobileDrawer()" class="block px-3 py-2 rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-100">
                Dashboard
              </a>
              <div class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3">Operations</div>
              <a routerLink="/app/customers/owners" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Owners</a>
              <a routerLink="/app/customers/tenants" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Tenants</a>
              <a routerLink="/app/properties" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Properties</a>
              <a routerLink="/app/maintenance/work-orders" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Work Orders</a>
              <a routerLink="/app/billing/invoices" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Invoices</a>

              <div class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3">Agreements</div>
              <a routerLink="/app/owner-agreements" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Owner Agreements</a>
              <a routerLink="/app/tenant-agreements" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Tenant Agreements</a>

              <div class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3">Accounts</div>
              <a routerLink="/app/accounts/dashboard" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Accounts Dashboard</a>
              <a routerLink="/app/accounts/inward" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Inward Receipts</a>
              <a routerLink="/app/accounts/outward" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Outward Vouchers</a>
              <a routerLink="/app/accounts/petty-cash" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Petty Cash Daybook</a>

              @if (isSuperAdmin()) {
                <div class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3">Administration</div>
                <a routerLink="/app/administration/branches" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Branches</a>
                <a routerLink="/app/administration/users" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Users</a>
                <a routerLink="/app/administration/roles" (click)="closeMobileDrawer()" class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100">Roles</a>
              }
            </nav>
          </div>

          <div class="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <div class="text-xs font-semibold text-[#0F172A]">{{ user()?.name }}</div>
            <button type="button" (click)="logout()" class="text-xs font-semibold text-red-600">Logout</button>
          </div>
        </aside>
      }

      <!-- MAIN WORKSPACE CONTENT AREA -->
      <main class="flex-1 flex flex-col h-full min-w-0 bg-[#F8FAFC] overflow-y-auto">
        <div class="flex-1 max-w-[1740px] w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
          <router-outlet></router-outlet>
        </div>

        <!-- Application Common Footer -->
        <div class="shrink-0 border-t border-[#E2E8F0] bg-white">
          <bm-footer></bm-footer>
        </div>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  loadingService = inject(BmLoadingService);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  user = this.authService.currentUser;
  isSuperAdmin = this.authService.isSuperAdmin;

  activeMegaMenu = signal<MegaMenuTab>(null);
  mobileDrawerOpen = signal(false);

  searchQuery = signal('');
  isSearchOpen = signal(false);
  selectedIndex = signal(0);

  readonly allSearchItems: PageSearchItem[] = [
    // Dashboard & Overview
    { title: 'Executive Overview', subtitle: 'Real-time ERP dashboard & metrics', category: 'Pages', url: '/app/dashboard', keywords: ['dashboard', 'home', 'overview', 'metrics', 'analytics'] },

    // Customers: Owners
    { title: 'Owner Directory', subtitle: 'List of property owners & investors', category: 'Customers', url: '/app/customers/owners', keywords: ['owner', 'owners', 'investor', 'landlord', 'directory', 'customer'] },
    { title: 'Add New Owner', subtitle: 'Register a new property owner', category: 'Actions', url: '/app/customers/owners/new', keywords: ['add owner', 'new owner', 'create owner', 'register owner'], badge: 'New Action' },

    // Customers: Tenants
    { title: 'Tenant Directory', subtitle: 'Active tenant directory & occupants', category: 'Customers', url: '/app/customers/tenants', keywords: ['tenant', 'tenants', 'renter', 'leaseholder', 'occupant'] },
    { title: 'Add New Tenant', subtitle: 'Register a new tenant', category: 'Actions', url: '/app/customers/tenants/new', keywords: ['add tenant', 'new tenant', 'create tenant', 'register tenant'], badge: 'New Action' },

    // Properties & Units
    { title: 'Property Directory', subtitle: 'Master property & unit portfolio', category: 'Properties', url: '/app/properties', keywords: ['property', 'properties', 'unit', 'building', 'portfolio', 'estate'] },
    { title: 'Add New Property', subtitle: 'Register a new property or unit', category: 'Actions', url: '/app/properties/new', keywords: ['add property', 'new property', 'create property', 'new unit'], badge: 'New Action' },

    // Owner Agreements
    { title: 'Owner Agreements', subtitle: 'Management contracts with owners', category: 'Agreements', url: '/app/owner-agreements', keywords: ['owner agreement', 'management contract', 'owner terms'] },
    { title: 'New Owner Agreement', subtitle: 'Create a new owner management contract', category: 'Actions', url: '/app/owner-agreements/new', keywords: ['new owner agreement', 'create owner agreement'], badge: 'New Action' },

    // Tenant Agreements
    { title: 'Tenant Agreements', subtitle: 'Lease contracts & rent schedules', category: 'Agreements', url: '/app/tenant-agreements', keywords: ['tenant agreement', 'lease', 'rent contract', 'expiry', 'installments'] },
    { title: 'New Tenant Lease', subtitle: 'Create a new tenant lease contract', category: 'Actions', url: '/app/tenant-agreements/new', keywords: ['new lease', 'create tenant agreement', 'new rent contract'], badge: 'New Action' },

    // Accounts & Financials
    { title: 'Accounts Dashboard', subtitle: 'Real-time financial ledger & position', category: 'Financials', url: '/app/accounts/dashboard', keywords: ['accounts', 'finance', 'ledger', 'cash flow', 'balance'] },
    { title: 'Inward Receipts', subtitle: 'Collection vouchers & incoming money', category: 'Financials', url: '/app/accounts/inward', keywords: ['inward', 'receipt', 'rent payment', 'income', 'cash in'] },
    { title: 'Issue Inward Receipt', subtitle: 'Record an incoming rent receipt voucher', category: 'Actions', url: '/app/accounts/inward', keywords: ['new receipt', 'issue inward', 'collect rent'], badge: 'New Action' },
    { title: 'Outward Vouchers', subtitle: 'Payment vouchers & disbursements', category: 'Financials', url: '/app/accounts/outward', keywords: ['outward', 'voucher', 'expense', 'payout', 'disbursement'] },
    { title: 'Issue Outward Voucher', subtitle: 'Record an outgoing payment voucher', category: 'Actions', url: '/app/accounts/outward', keywords: ['new voucher', 'issue outward', 'make payment'], badge: 'New Action' },
    { title: 'Petty Cash Daybook', subtitle: 'Daily petty cash transactions log', category: 'Financials', url: '/app/accounts/petty-cash', keywords: ['petty cash', 'daybook', 'daily cash', 'expenses'] },

    // Maintenance & Inventory
    { title: 'Work Orders', subtitle: 'Maintenance requests & repairs', category: 'Pages', url: '/app/maintenance/work-orders', keywords: ['work order', 'maintenance', 'repair', 'ticket', 'dispatch'] },
    { title: 'Vendors Directory', subtitle: 'Approved contractors & service providers', category: 'Pages', url: '/app/maintenance/vendors', keywords: ['vendor', 'contractor', 'supplier', 'plumber', 'electrician'] },
    { title: 'Inventory Management', subtitle: 'Stock items & spare parts', category: 'Pages', url: '/app/maintenance/inventory', keywords: ['inventory', 'stock', 'parts', 'spares'] },

    // Billing & Reports
    { title: 'Quotations', subtitle: 'Price quotes & cost estimates', category: 'Pages', url: '/app/billing/quotations', keywords: ['quotation', 'quote', 'estimate'] },
    { title: 'Invoices', subtitle: 'Receivable billing invoices', category: 'Pages', url: '/app/billing/invoices', keywords: ['invoice', 'billing', 'statement'] },
    { title: 'Financial Reports', subtitle: 'Operational & audit reports', category: 'Pages', url: '/app/reports', keywords: ['reports', 'statement', 'financial report', 'audit'] },
    { title: 'Disputes & Claims', subtitle: 'Tenant & owner dispute management', category: 'Pages', url: '/app/disputes', keywords: ['dispute', 'complaint', 'issue', 'claim'] },

    // Administration (Super Admin)
    { title: 'Branch Management', subtitle: 'Branches & office locations', category: 'System', url: '/app/administration/branches', keywords: ['branch', 'branches', 'location', 'office'], adminOnly: true },
    { title: 'User Management', subtitle: 'Staff accounts & system users', category: 'System', url: '/app/administration/users', keywords: ['user', 'users', 'staff', 'employee', 'account'], adminOnly: true },
    { title: 'Roles & Permissions', subtitle: 'Security roles & access control', category: 'System', url: '/app/administration/roles', keywords: ['role', 'roles', 'permission', 'security', 'access'], adminOnly: true },
  ];

  filteredSearchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const isAdmin = this.isSuperAdmin();

    const items = this.allSearchItems.filter((item) => !item.adminOnly || isAdmin);

    if (!query) {
      return items.slice(0, 8); // Top quick shortcuts
    }

    return items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSub = item.subtitle?.toLowerCase().includes(query) || false;
      const matchCat = item.category.toLowerCase().includes(query);
      const matchKeyword = item.keywords.some((k) => k.toLowerCase().includes(query));
      return matchTitle || matchSub || matchCat || matchKeyword;
    });
  });

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.setRouteLoading(true);
        this.closeMegaMenu();
        this.closeSearch();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.setRouteLoading(false);
      }
    });
  }

  toggleMegaMenu(tab: MegaMenuTab, event: Event): void {
    event.stopPropagation();
    if (this.activeMegaMenu() === tab) {
      this.activeMegaMenu.set(null);
    } else {
      this.activeMegaMenu.set(tab);
      this.closeSearch();
    }
  }

  closeMegaMenu(): void {
    this.activeMegaMenu.set(null);
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update((v) => !v);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.isSearchOpen.set(true);
    this.selectedIndex.set(0);
  }

  openSearch(): void {
    this.isSearchOpen.set(true);
    this.closeMegaMenu();
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.selectedIndex.set(0);
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.focus();
    }
  }

  selectSearchResult(item: PageSearchItem): void {
    this.closeSearch();
    this.searchQuery.set('');
    this.router.navigateByUrl(item.url);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const results = this.filteredSearchResults();
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update((idx) => (idx + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update((idx) => (idx - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[this.selectedIndex()];
      if (selected) {
        this.selectSearchResult(selected);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (event.key === '/' && !isInput) {
      event.preventDefault();
      this.openSearch();
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeMegaMenu();
    this.closeMobileDrawer();
    this.closeSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMegaMenu();
      this.closeSearch();
    }
  }

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
}
