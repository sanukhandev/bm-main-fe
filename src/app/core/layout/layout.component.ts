import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BmLoadingService } from '../services/bm-loading.service';
import { BranchContextService } from '../branch-context/branch-context.service';
import { Branch } from '../branch-context/branch.models';
import { BmFooterComponent } from '../../shared/components/bm-footer/bm-footer.component';

export type MegaMenuTab = 'operations' | 'agreements' | 'accounts' | 'reports' | 'admin' | null;

export interface PageSearchItem {
  title: string;
  subtitle?: string;
  category:
    | 'Pages'
    | 'Actions'
    | 'Customers'
    | 'Properties'
    | 'Agreements'
    | 'Financials'
    | 'Reports'
    | 'System';
  url: string;
  keywords: string[];
  badge?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'bm-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BmFooterComponent],
  template: `
    <div
      class="h-screen w-full max-w-full flex flex-col overflow-hidden bg-[#F8FAFC] relative font-sans text-[#0F172A] select-none"
    >
      <!-- Global Top Loading Progress Bar -->
      @if (loadingService.isLoading()) {
        <div
          class="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900/10 backdrop-blur-xs overflow-hidden"
        >
          <div
            class="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-slate-900 animate-bm-top-loader shadow-[0_0_10px_rgba(16,185,129,0.5)] w-full"
          ></div>
        </div>
      }

      <!-- TOP NAVIGATION BAR (Desktop & Mobile Header) -->
      <header
        class="h-[70px] shrink-0 border-b border-[#E2E8F0] bg-white px-3 sm:px-4 md:px-6 xl:px-8 flex items-center justify-between z-40 relative shadow-2xs max-w-full"
      >
        <!-- LEFT: BRANDING MONOGRAM & TITLE (WITH LOGO BRANCH SWITCHER) -->
        <div class="flex items-center gap-2 sm:gap-4 xl:gap-6 min-w-0 shrink-0">
          <div class="relative flex items-center">
            <button
              type="button"
              (click)="toggleLogoBranchDropdown($event)"
              class="flex items-center gap-2.5 sm:gap-3 group shrink-0 text-left cursor-pointer p-1 -ml-1 rounded-xl hover:bg-slate-100/80 transition"
              [title]="
                availableBranches().length > 1
                  ? 'Click to switch operating branch'
                  : 'Baithul Madeena ERP'
              "
            >
              <div
                class="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform shrink-0"
              >
                BM
              </div>
              <div class="hidden sm:block overflow-hidden whitespace-nowrap">
                <div
                  class="font-bold text-[#0F172A] tracking-tight text-sm leading-tight flex items-center gap-1.5"
                >
                  <span>Baithul Madeena</span>
                  @if (activeBranch()) {
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 uppercase tracking-wider flex items-center gap-1"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {{ activeBranch()?.code }}
                      @if (availableBranches().length > 1) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3 text-emerald-600 transition-transform duration-200"
                          [class.rotate-180]="logoBranchDropdownOpen()"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      }
                    </span>
                  }
                </div>
                <div
                  class="text-[10px] text-[#64748B] font-semibold tracking-widest uppercase flex items-center gap-1"
                >
                  <span>Real Estate ERP</span>
                  @if (activeBranch() && availableBranches().length > 1) {
                    <span class="text-[9px] text-emerald-600 font-normal lowercase"
                      >• switch branch</span
                    >
                  }
                </div>
              </div>
            </button>

            <!-- Logo Branch Switcher Dropdown Popover -->
            @if (logoBranchDropdownOpen() && availableBranches().length > 1) {
              <div
                class="absolute top-12 left-0 z-50 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-2 animate-scale-up"
                (click)="$event.stopPropagation()"
              >
                <div
                  class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-1"
                >
                  <span>Switch Operating Branch</span>
                  <span
                    class="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[9px]"
                    >{{ availableBranches().length }} Active</span
                  >
                </div>
                <div class="space-y-1 max-h-60 overflow-y-auto">
                  @for (branch of availableBranches(); track branch.id) {
                    <button
                      type="button"
                      (click)="selectLogoBranch(branch)"
                      class="w-full text-left p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer group"
                      [class.bg-emerald-50]="branch.id === activeBranch()?.id"
                      [class.border]="branch.id === activeBranch()?.id"
                      [class.border-emerald-200]="branch.id === activeBranch()?.id"
                      [class.hover:bg-slate-50]="branch.id !== activeBranch()?.id"
                    >
                      <div>
                        <div
                          class="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-800"
                        >
                          <span class="text-emerald-700 font-extrabold">[{{ branch.code }}]</span>
                          <span>{{ branch.name }}</span>
                        </div>
                        <div class="text-[10px] text-slate-500 font-medium mt-0.5">
                          {{ branch.currency_code || 'AED' }} • {{ branch.timezone || 'UAE' }}
                        </div>
                      </div>
                      @if (branch.id === activeBranch()?.id) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-emerald-600 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- DESKTOP CENTER PRIMARY NAVIGATION LINKS -->
          <nav class="hidden lg:flex items-center gap-1 xl:gap-1.5 ml-1 xl:ml-4 shrink-0">
            <!-- Dashboard (Direct Link with Capsule Active State) -->
            <a
              routerLink="/app/dashboard"
              routerLinkActive="bg-[#0F172A] text-white font-semibold shadow-xs"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMegaMenu()"
              class="h-[38px] px-3 xl:px-4 rounded-full text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 transition-all flex items-center gap-1"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                [class.rotate-180]="activeMegaMenu() === 'operations'"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                [class.rotate-180]="activeMegaMenu() === 'agreements'"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                [class.rotate-180]="activeMegaMenu() === 'accounts'"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                [class.rotate-180]="activeMegaMenu() === 'reports'"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5 transition-transform duration-200"
                  [class.rotate-180]="activeMegaMenu() === 'admin'"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            }
          </nav>
        </div>

        <!-- RIGHT: NOTIFICATIONS, USER CLUSTER & MOBILE TOGGLE -->
        <div class="flex items-center gap-1.5 sm:gap-2 xl:gap-3 shrink-0">
          <!-- Notification Bell Icon Button -->
          <button
            type="button"
            title="Notifications"
            class="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] hover:bg-slate-50 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs"
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
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
              <div class="text-xs font-semibold text-[#0F172A] truncate max-w-[110px]">
                {{ user()?.name }}
              </div>
              <div class="text-[10px] text-[#64748B] font-medium capitalize truncate">
                {{ primaryRole() }}
              </div>
            </div>

            <button
              type="button"
              (click)="logout()"
              title="Sign Out"
              class="text-[#64748B] hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition shrink-0 cursor-pointer"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          <!-- Mobile Navigation Toggle Button (< 1024px) -->
          <button
            type="button"
            (click)="toggleMobileDrawer()"
            class="lg:hidden text-[#334155] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      @if (shortcutHelpOpen()) {
        <div
          class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
          (click)="closeShortcutHelp()"
        ></div>
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcut-help-title"
          class="fixed bottom-16 left-5 z-50 w-[330px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.18)] animate-fade-in"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 id="shortcut-help-title" class="text-sm font-bold text-[#0F172A]">
                Keyboard shortcuts
              </h2>
              <p class="mt-1 text-[11px] text-[#64748B]">Move around Baithul Madeena faster.</p>
            </div>
            <button
              type="button"
              aria-label="Close keyboard shortcuts"
              (click)="closeShortcutHelp()"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span class="text-slate-700">Open global search</span>
              <kbd
                class="rounded border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-500"
                >Ctrl K</kbd
              >
            </div>
            <div class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span class="text-slate-700">Search focused list</span>
              <kbd
                class="rounded border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-500"
                >/</kbd
              >
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              @for (shortcut of pageShortcuts; track shortcut.key) {
                <div
                  class="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span class="truncate text-slate-600">{{ shortcut.label }}</span>
                  <kbd
                    class="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
                    >Ctrl {{ shortcut.key }}</kbd
                  >
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- MAC SPOTLIGHT COMMAND PALETTE OVERLAY MODAL -->
      @if (isSearchOpen()) {
        <!-- Backdrop Overlay -->
        <div
          class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-24 animate-fade-in"
          (click)="closeSearch()"
        >
          <!-- Spotlight Card Modal -->
          <div
            class="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_75px_rgba(15,23,42,0.28)] border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[620px] animate-scale-up"
            (click)="$event.stopPropagation()"
          >
            <!-- Spotlight Header Search Input -->
            <div
              class="px-4 py-3.5 sm:px-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0"
            >
              <div
                class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                #searchInput
                type="text"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (keydown)="onSearchKeydown($event)"
                placeholder="Type a command, page name, or search term..."
                class="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 outline-none border-none focus:ring-0"
              />

              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition shrink-0"
                  title="Clear query"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              }

              <button
                type="button"
                (click)="closeSearch()"
                class="px-2 py-1 rounded-md text-[11px] font-bold text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 transition shrink-0 cursor-pointer"
              >
                ESC
              </button>
            </div>

            <!-- Spotlight Results List -->
            <div class="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              @if (filteredSearchResults().length > 0) {
                <div
                  class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center"
                >
                  <span>Spotlight Suggestions ({{ filteredSearchResults().length }})</span>
                  <span>Press ↑↓ to navigate</span>
                </div>

                @for (
                  item of filteredSearchResults();
                  track item.url + item.title;
                  let idx = $index
                ) {
                  <button
                    type="button"
                    (click)="selectSearchResult(item)"
                    (mouseenter)="selectedIndex.set(idx)"
                    [class.bg-emerald-50/80]="selectedIndex() === idx"
                    [class.border-emerald-200]="selectedIndex() === idx"
                    [class.shadow-xs]="selectedIndex() === idx"
                    class="w-full text-left p-3 rounded-xl transition flex items-center justify-between group border border-transparent cursor-pointer"
                  >
                    <div class="flex items-center gap-3.5 min-w-0">
                      <!-- Category Icon Box -->
                      <div
                        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs"
                        [class.bg-emerald-100/80]="
                          item.category === 'Pages' || item.category === 'Customers'
                        "
                        [class.text-emerald-800]="
                          item.category === 'Pages' || item.category === 'Customers'
                        "
                        [class.bg-blue-100/80]="item.category === 'Properties'"
                        [class.text-blue-800]="item.category === 'Properties'"
                        [class.bg-amber-100/80]="
                          item.category === 'Agreements' || item.category === 'Actions'
                        "
                        [class.text-amber-800]="
                          item.category === 'Agreements' || item.category === 'Actions'
                        "
                        [class.bg-rose-100/80]="item.category === 'Financials'"
                        [class.text-rose-800]="item.category === 'Financials'"
                        [class.bg-purple-100/80]="item.category === 'Reports'"
                        [class.text-purple-800]="item.category === 'Reports'"
                        [class.bg-slate-100]="item.category === 'System'"
                        [class.text-slate-800]="item.category === 'System'"
                      >
                        @if (item.category === 'Customers') {
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
                              stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        } @else if (item.category === 'Properties') {
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
                              stroke-width="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        } @else if (item.category === 'Agreements') {
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
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        } @else if (item.category === 'Financials') {
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
                              stroke-width="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        } @else if (item.category === 'Actions') {
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
                              stroke-width="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
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
                              stroke-width="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        }
                      </div>

                      <div class="min-w-0">
                        <div
                          class="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-800 flex items-center gap-2"
                        >
                          <span>{{ item.title }}</span>
                          @if (item.badge) {
                            <span
                              class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800"
                            >
                              {{ item.badge }}
                            </span>
                          }
                        </div>
                        @if (item.subtitle) {
                          <div class="text-xs text-slate-500 truncate mt-0.5">
                            {{ item.subtitle }}
                          </div>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 pl-2">
                      <span
                        class="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-800"
                      >
                        {{ item.category }}
                      </span>
                      @if (selectedIndex() === idx) {
                        <span class="text-xs font-bold text-emerald-600">↵</span>
                      }
                    </div>
                  </button>
                }
              } @else {
                <div class="py-12 text-center">
                  <div
                    class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div class="text-sm font-semibold text-slate-700">
                    No results found for "{{ searchQuery() }}"
                  </div>
                  <div class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try searching for "Owner", "Tenant", "Lease", "Inward", "Petty Cash", "Work
                    Order", or "Intelligent Report".
                  </div>
                </div>
              }
            </div>

            <!-- Spotlight Footer Legend -->
            <div
              class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0"
            >
              <div class="flex items-center gap-4 text-[11px]">
                <span
                  ><kbd
                    class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600"
                    >↑↓</kbd
                  >
                  navigate</span
                >
                <span
                  ><kbd
                    class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600"
                    >↵</kbd
                  >
                  select</span
                >
                <span
                  ><kbd
                    class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600"
                    >ESC</kbd
                  >
                  close</span
                >
              </div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Baithul Madeena Spotlight</span
              >
            </div>
          </div>
        </div>
      }

      <!-- MEGA MENU POPOVER PANELS (Desktop floating below top nav) -->
      @if (activeMegaMenu()) {
        <!-- Backdrop Overlay to close mega menu -->
        <div
          class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
          (click)="closeMegaMenu()"
        ></div>

        <div
          class="absolute top-[72px] left-1/2 -translate-x-1/2 z-50 w-[720px] max-w-[94vw] bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-6 transition-all duration-180 animate-fade-in"
          (click)="$event.stopPropagation()"
        >
          <!-- OPERATIONS MEGA MENU -->
          @if (activeMegaMenu() === 'operations') {
            <div class="grid grid-cols-3 gap-6">
              <!-- Customers Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Customers
                </div>
                <div class="space-y-1">
                  <a
                    routerLink="/app/customers/owners"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                        Owners
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Property owners & investors
                      </div>
                    </div>
                  </a>
                  <a
                    routerLink="/app/customers/tenants"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                        Tenants
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Active tenant directory
                      </div>
                    </div>
                  </a>
                </div>

                <div
                  class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mt-5 mb-3"
                >
                  Portfolio
                </div>
                <div class="space-y-1">
                  <a
                    routerLink="/app/properties"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
                        Properties
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Master real estate directory
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Maintenance Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Maintenance
                </div>
                <div class="space-y-1">
                  <a
                    routerLink="/app/maintenance/work-orders"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">
                        Work Orders
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Service requests & repairs
                      </div>
                    </div>
                  </a>
                  <a
                    routerLink="/app/maintenance/vendors"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">
                        Vendors
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Approved contractors
                      </div>
                    </div>
                  </a>
                  <a
                    routerLink="/app/maintenance/inventory"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">
                        Inventory
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Spare parts & stock
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Billing Column -->
              <div>
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Billing
                </div>
                <div class="space-y-1">
                  <a
                    routerLink="/app/billing/quotations"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M9 7h6m-6 4h6m-6 4h4m5 6H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">
                        Quotations
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Price quotes & estimates
                      </div>
                    </div>
                  </a>
                  <a
                    routerLink="/app/billing/invoices"
                    (click)="closeMegaMenu()"
                    class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">
                        Invoices
                      </div>
                      <div class="text-[10px] text-[#64748B] leading-tight">
                        Receivable billing invoices
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- AGREEMENTS MEGA MENU -->
          @if (activeMegaMenu() === 'agreements') {
            <div class="grid grid-cols-2 gap-6">
              <a
                routerLink="/app/owner-agreements"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition border border-transparent hover:border-[#E2E8F0]"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#0F172A] group-hover:text-[#D97706]">
                    Owner Agreements
                  </div>
                  <div class="text-xs text-[#64748B] mt-0.5">
                    Management agreements & terms with property owners
                  </div>
                </div>
              </a>

              <a
                routerLink="/app/tenant-agreements"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition border border-transparent hover:border-[#E2E8F0]"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#0F172A] group-hover:text-[#047857]">
                    Tenant Agreements
                  </div>
                  <div class="text-xs text-[#64748B] mt-0.5">
                    Leasing contracts & rent schedules with tenants
                  </div>
                </div>
              </a>
            </div>
          }

          <!-- ACCOUNTS MEGA MENU -->
          @if (activeMegaMenu() === 'accounts') {
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-1">
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Accounting Operations
                </div>
                <a
                  routerLink="/app/accounts/dashboard"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                        stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                      Accounts Overview
                    </div>
                    <div class="text-[10px] text-[#64748B]">Real-time balances & ledger</div>
                  </div>
                </a>

                <a
                  routerLink="/app/accounts/inward"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                        stroke-width="2"
                        d="M9 11l3 3m0 0l3-3m-3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                      Inward Receipts
                    </div>
                    <div class="text-[10px] text-[#64748B]">
                      Collection vouchers & incoming money
                    </div>
                  </div>
                </a>

                <a
                  routerLink="/app/accounts/outward"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                        stroke-width="2"
                        d="M15 13l-3-3m0 0l-3 3m3-3v6m0-13a9 9 0 110-18 9 9 0 010 18z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">
                      Outward Vouchers
                    </div>
                    <div class="text-[10px] text-[#64748B]">Disbursements & payment vouchers</div>
                  </div>
                </a>
              </div>

              <div class="space-y-1">
                <div class="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Ledger & Cash Flow
                </div>
                <a
                  routerLink="/app/accounts/petty-cash"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                        stroke-width="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">
                      Petty Cash Daybook
                    </div>
                    <div class="text-[10px] text-[#64748B]">Daily petty cash transactions</div>
                  </div>
                </a>

                <a
                  routerLink="/app/accounts/reports"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                        stroke-width="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
                      Financial Reports
                    </div>
                    <div class="text-[10px] text-[#64748B]">Income & expenditure statements</div>
                  </div>
                </a>
              </div>
            </div>
          }

          <!-- REPORTS MEGA MENU -->
          @if (activeMegaMenu() === 'reports') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                routerLink="/app/reports/intelligent"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 transition-all"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                      Intelligent Report
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                    >
                      AI Insights
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Management intelligence, revenue leakage & AI metrics
                  </p>
                </div>
              </a>

              <a
                routerLink="/app/reports/owner-agreements"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <span class="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                    Core Operational Reports
                  </span>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Master agreements, receivables, payables & cash metrics
                  </p>
                </div>
              </a>

              <a
                routerLink="/app/accounts/reports"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span class="text-sm font-bold text-slate-900 group-hover:text-green-600">
                    Financial Statements
                  </span>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Income, expenditure & daily movement statements
                  </p>
                </div>
              </a>

              @if (hasPermission('audit.view')) {
                <a
                  routerLink="/app/administration/audit"
                  (click)="closeMegaMenu()"
                  class="group flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div
                    class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
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
                  </div>
                  <div>
                    <span class="text-sm font-bold text-slate-900 group-hover:text-rose-600">
                      Audit Trail
                    </span>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                      Sensitive activity & security logs
                    </p>
                  </div>
                </a>
              }
            </div>
          }

          <!-- ADMINISTRATION MEGA MENU (Super Admin Only) -->
          @if (activeMegaMenu() === 'admin' && isSuperAdmin()) {
            <div class="grid grid-cols-3 gap-6">
              <a
                routerLink="/app/administration/branches"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                    Branches
                  </div>
                  <div class="text-[10px] text-[#64748B]">Branch setup & scopes</div>
                </div>
              </a>

              <a
                routerLink="/app/administration/users"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                    Users
                  </div>
                  <div class="text-[10px] text-[#64748B]">Manage user accounts</div>
                </div>
              </a>

              <a
                routerLink="/app/administration/roles"
                (click)="closeMegaMenu()"
                class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-[#0F172A] group-hover:text-[#047857]">
                    Roles
                  </div>
                  <div class="text-[10px] text-[#64748B]">Permissions & security</div>
                </div>
              </a>
            </div>
          }
        </div>
      }

      <!-- MOBILE / TABLET NAVIGATION DRAWER FALLBACK (< 1024px) -->
      @if (mobileDrawerOpen()) {
        <div
          class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          (click)="closeMobileDrawer()"
        ></div>

        <aside
          class="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white border-l border-[#E2E8F0] p-5 flex flex-col justify-between shadow-2xl lg:hidden animate-fade-in"
        >
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs"
                >
                  BM
                </div>
                <div class="font-bold text-sm text-[#0F172A]">Navigation</div>
              </div>
              <button
                type="button"
                (click)="closeMobileDrawer()"
                class="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav class="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
              <button
                type="button"
                (click)="closeMobileDrawer(); openSearch()"
                class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition mb-2 cursor-pointer border border-slate-200/60"
              >
                <span class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Search Spotlight...</span>
                </span>
                <kbd
                  class="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 font-bold"
                  >Ctrl K</kbd
                >
              </button>

              <a
                routerLink="/app/dashboard"
                (click)="closeMobileDrawer()"
                class="block px-3 py-2 rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-100"
              >
                Dashboard
              </a>
              <div
                class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3"
              >
                Operations
              </div>
              <a
                routerLink="/app/customers/owners"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Owners</a
              >
              <a
                routerLink="/app/customers/tenants"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Tenants</a
              >
              <a
                routerLink="/app/properties"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Properties</a
              >
              <a
                routerLink="/app/maintenance/work-orders"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Work Orders</a
              >
              <a
                routerLink="/app/billing/invoices"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Invoices</a
              >

              <div
                class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3"
              >
                Agreements
              </div>
              <a
                routerLink="/app/owner-agreements"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Owner Agreements</a
              >
              <a
                routerLink="/app/tenant-agreements"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Tenant Agreements</a
              >

              <div
                class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3"
              >
                Accounts
              </div>
              <a
                routerLink="/app/accounts/dashboard"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Accounts Dashboard</a
              >
              <a
                routerLink="/app/accounts/inward"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Inward Receipts</a
              >
              <a
                routerLink="/app/accounts/outward"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Outward Vouchers</a
              >
              <a
                routerLink="/app/accounts/petty-cash"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Petty Cash Daybook</a
              >

              @if (isSuperAdmin()) {
                <div
                  class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3"
                >
                  Administration
                </div>
                <a
                  routerLink="/app/administration/branches"
                  (click)="closeMobileDrawer()"
                  class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                  >Branches</a
                >
                <a
                  routerLink="/app/administration/users"
                  (click)="closeMobileDrawer()"
                  class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                  >Users</a
                >
                <a
                  routerLink="/app/administration/roles"
                  (click)="closeMobileDrawer()"
                  class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                  >Roles</a
                >
              }

              <div
                class="pt-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3"
              >
                Help & Legal
              </div>
              <a
                routerLink="/app/about"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >About Application</a
              >
              <a
                routerLink="/app/faq"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >FAQ & Guide</a
              >
              <a
                routerLink="/app/terms-of-use"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Terms of Use</a
              >
              <a
                routerLink="/app/privacy-policy"
                (click)="closeMobileDrawer()"
                class="block px-3 py-1.5 rounded-lg text-xs text-[#334155] hover:bg-slate-100"
                >Privacy Policy</a
              >
            </nav>
          </div>

          <div class="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <div class="text-xs font-semibold text-[#0F172A]">{{ user()?.name }}</div>
            <button type="button" (click)="logout()" class="text-xs font-semibold text-red-600">
              Logout
            </button>
          </div>
        </aside>
      }

      <!-- MAIN WORKSPACE CONTENT AREA -->
      <main
        class="flex-1 flex flex-col h-full min-w-0 max-w-full bg-[#F8FAFC] overflow-y-auto overflow-x-hidden"
      >
        <div class="flex-1 max-w-[1740px] w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
          <router-outlet></router-outlet>
        </div>

        <!-- Application Common Footer -->
        <div class="shrink-0 border-t border-[#E2E8F0] bg-white">
          <bm-footer></bm-footer>
        </div>
      </main>
      <!-- LEFT BOTTOM FLOATING WIDGET (Help Icon, Keyboard Shortcuts & Search Spotlight) -->
      <div
        class="fixed bottom-5 left-5 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.14)] rounded-full p-1.5"
      >
        <!-- Help Submenu Trigger (Icon Only) -->
        <div #helpMenuContainer class="relative">
          <button
            type="button"
            (click)="toggleHelpMenu($event)"
            [class.bg-[#0F172A]]="helpMenuOpen()"
            [class.text-white]="helpMenuOpen()"
            [class.text-slate-600]="!helpMenuOpen()"
            title="Help & Legal Documents"
            class="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093V14m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- HELP SUBMENU POPOVER (Floats above left widget) -->
          @if (helpMenuOpen()) {
            <div
              class="absolute bottom-12 left-0 z-50 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.20)] p-2 animate-fade-in space-y-0.5"
              (click)="$event.stopPropagation()"
            >
              <div
                class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Help & Support
              </div>

              <!-- About Application -->
              <a
                routerLink="/app/about"
                (click)="closeHelpMenu()"
                class="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-teal-700">
                    About Application
                  </div>
                  <div class="text-[10px] text-slate-500">System overview & developer info</div>
                </div>
              </a>

              <!-- FAQ & User Guide -->
              <a
                routerLink="/app/faq"
                (click)="closeHelpMenu()"
                class="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093V14m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-emerald-700">
                    FAQ & User Guide
                  </div>
                  <div class="text-[10px] text-slate-500">System operations & answers</div>
                </div>
              </a>

              <div class="border-t border-slate-100 my-1"></div>

              <div
                class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Legal Documents
              </div>

              <!-- Terms of Use -->
              <a
                routerLink="/app/privacy-terms"
                (click)="closeHelpMenu()"
                class="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                    Terms of Use
                  </div>
                  <div class="text-[10px] text-slate-500">Enterprise license & terms</div>
                </div>
              </a>

              <!-- Privacy Policy -->
              <a
                routerLink="/app/privacy-terms"
                (click)="closeHelpMenu()"
                class="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                    Privacy Policy
                  </div>
                  <div class="text-[10px] text-slate-500">UAE Data protection policy</div>
                </div>
              </a>

              <!-- All Legal Docs -->
              <a
                routerLink="/app/privacy-terms"
                (click)="closeHelpMenu()"
                class="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
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
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-purple-600">
                    All Legal Documents
                  </div>
                  <div class="text-[10px] text-slate-500">Full legal suite & printable</div>
                </div>
              </a>
            </div>
          }
        </div>

        <div class="w-px h-4 bg-slate-200 my-auto"></div>

        <!-- Keyboard Shortcuts Trigger Button -->
        <button
          type="button"
          title="Keyboard shortcuts (Ctrl + /)"
          aria-label="Show keyboard shortcuts"
          (click)="toggleShortcutHelp()"
          [class.bg-[#0F172A]]="shortcutHelpOpen()"
          [class.text-white]="shortcutHelpOpen()"
          [class.text-slate-600]="!shortcutHelpOpen()"
          class="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path
              d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"
            />
          </svg>
        </button>

        <div class="w-px h-4 bg-slate-200 my-auto"></div>

        <!-- Spotlight Search Trigger Button -->
        <button
          type="button"
          title="Search Spotlight (Ctrl + K)"
          (click)="openSearch()"
          class="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      <!-- RIGHT BOTTOM FLOATING WIDGET (Zaakiy AI Assistant) -->
      <button
        type="button"
        (click)="openZaakiy()"
        title="Zaakiy AI Assistant"
        class="fixed bottom-5 right-5 z-40 h-11 px-4 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)] border border-slate-700/60 flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:scale-105 group"
      >
        <div
          class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform"
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
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span class="text-xs font-bold tracking-wide">Zaakiy AI</span>
        <span
          class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        ></span>
      </button>
    </div>
  `,
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private branchContext = inject(BranchContextService);
  loadingService = inject(BmLoadingService);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('searchContainer') searchContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('helpMenuContainer') helpMenuContainerRef?: ElementRef<HTMLElement>;

  user = this.authService.currentUser;
  isSuperAdmin = this.authService.isSuperAdmin;
  hasPermission = (permission: string): boolean => this.authService.hasPermission(permission);

  activeBranch = this.branchContext.activeBranch;
  availableBranches = this.branchContext.availableBranches;
  logoBranchDropdownOpen = signal(false);

  activeMegaMenu = signal<MegaMenuTab>(null);
  mobileDrawerOpen = signal(false);
  shortcutHelpOpen = signal(false);
  helpMenuOpen = signal(false);

  readonly pageShortcuts = [
    { key: '1', label: 'Dashboard' },
    { key: '2', label: 'Owners' },
    { key: '3', label: 'Tenants' },
    { key: '4', label: 'Properties' },
    { key: '5', label: 'Owner agreements' },
    { key: '6', label: 'Tenant agreements' },
    { key: '7', label: 'Accounts' },
    { key: '8', label: 'Reports' },
  ] as const;

  searchQuery = signal('');
  isSearchOpen = signal(false);
  selectedIndex = signal(0);

  readonly allSearchItems: PageSearchItem[] = [
    // Dashboard & Overview
    {
      title: 'Executive Overview',
      subtitle: 'Real-time ERP dashboard & metrics',
      category: 'Pages',
      url: '/app/dashboard',
      keywords: ['dashboard', 'home', 'overview', 'metrics', 'analytics'],
    },

    // Customers: Owners
    {
      title: 'Owner Directory',
      subtitle: 'List of property owners & investors',
      category: 'Customers',
      url: '/app/customers/owners',
      keywords: ['owner', 'owners', 'investor', 'landlord', 'directory', 'customer'],
    },
    {
      title: 'Add New Owner',
      subtitle: 'Register a new property owner',
      category: 'Actions',
      url: '/app/customers/owners/new',
      keywords: ['add owner', 'new owner', 'create owner', 'register owner'],
      badge: 'New Action',
    },

    // Customers: Tenants
    {
      title: 'Tenant Directory',
      subtitle: 'Active tenant directory & occupants',
      category: 'Customers',
      url: '/app/customers/tenants',
      keywords: ['tenant', 'tenants', 'renter', 'leaseholder', 'occupant'],
    },
    {
      title: 'Add New Tenant',
      subtitle: 'Register a new tenant',
      category: 'Actions',
      url: '/app/customers/tenants/new',
      keywords: ['add tenant', 'new tenant', 'create tenant', 'register tenant'],
      badge: 'New Action',
    },

    // Properties & Units
    {
      title: 'Property Directory',
      subtitle: 'Master property & unit portfolio',
      category: 'Properties',
      url: '/app/properties',
      keywords: ['property', 'properties', 'unit', 'building', 'portfolio', 'estate'],
    },
    {
      title: 'Add New Property',
      subtitle: 'Register a new property or unit',
      category: 'Actions',
      url: '/app/properties/new',
      keywords: ['add property', 'new property', 'create property', 'new unit'],
      badge: 'New Action',
    },

    // Owner Agreements
    {
      title: 'Owner Agreements',
      subtitle: 'Management contracts with owners',
      category: 'Agreements',
      url: '/app/owner-agreements',
      keywords: ['owner agreement', 'management contract', 'owner terms'],
    },
    {
      title: 'New Owner Agreement',
      subtitle: 'Create a new owner management contract',
      category: 'Actions',
      url: '/app/owner-agreements/new',
      keywords: ['new owner agreement', 'create owner agreement'],
      badge: 'New Action',
    },

    // Tenant Agreements
    {
      title: 'Tenant Agreements',
      subtitle: 'Lease contracts & rent schedules',
      category: 'Agreements',
      url: '/app/tenant-agreements',
      keywords: ['tenant agreement', 'lease', 'rent contract', 'expiry', 'installments'],
    },
    {
      title: 'New Tenant Lease',
      subtitle: 'Create a new tenant lease contract',
      category: 'Actions',
      url: '/app/tenant-agreements/new',
      keywords: ['new lease', 'create tenant agreement', 'new rent contract'],
      badge: 'New Action',
    },

    // Accounts & Financials
    {
      title: 'Accounts Dashboard',
      subtitle: 'Real-time financial ledger & position',
      category: 'Financials',
      url: '/app/accounts/dashboard',
      keywords: ['accounts', 'finance', 'ledger', 'cash flow', 'balance'],
    },
    {
      title: 'Inward Receipts',
      subtitle: 'Collection vouchers & incoming money',
      category: 'Financials',
      url: '/app/accounts/inward',
      keywords: ['inward', 'receipt', 'rent payment', 'income', 'cash in'],
    },
    {
      title: 'Issue Inward Receipt',
      subtitle: 'Record an incoming rent receipt voucher',
      category: 'Actions',
      url: '/app/accounts/inward',
      keywords: ['new receipt', 'issue inward', 'collect rent'],
      badge: 'New Action',
    },
    {
      title: 'Outward Vouchers',
      subtitle: 'Payment vouchers & disbursements',
      category: 'Financials',
      url: '/app/accounts/outward',
      keywords: ['outward', 'voucher', 'expense', 'payout', 'disbursement'],
    },
    {
      title: 'Issue Outward Voucher',
      subtitle: 'Record an outgoing payment voucher',
      category: 'Actions',
      url: '/app/accounts/outward',
      keywords: ['new voucher', 'issue outward', 'make payment'],
      badge: 'New Action',
    },
    {
      title: 'Petty Cash Daybook',
      subtitle: 'Daily petty cash transactions log',
      category: 'Financials',
      url: '/app/accounts/petty-cash',
      keywords: ['petty cash', 'daybook', 'daily cash', 'expenses'],
    },

    // Maintenance & Inventory
    {
      title: 'Work Orders',
      subtitle: 'Maintenance requests & repairs',
      category: 'Pages',
      url: '/app/maintenance/work-orders',
      keywords: ['work order', 'maintenance', 'repair', 'ticket', 'dispatch'],
    },
    {
      title: 'Vendors Directory',
      subtitle: 'Approved contractors & service providers',
      category: 'Pages',
      url: '/app/maintenance/vendors',
      keywords: ['vendor', 'contractor', 'supplier', 'plumber', 'electrician'],
    },
    {
      title: 'Inventory Management',
      subtitle: 'Stock items & spare parts',
      category: 'Pages',
      url: '/app/maintenance/inventory',
      keywords: ['inventory', 'stock', 'parts', 'spares'],
    },

    // Billing & Reports
    {
      title: 'Quotations',
      subtitle: 'Price quotes & cost estimates',
      category: 'Pages',
      url: '/app/billing/quotations',
      keywords: ['quotation', 'quote', 'estimate'],
    },
    {
      title: 'Invoices',
      subtitle: 'Receivable billing invoices',
      category: 'Pages',
      url: '/app/billing/invoices',
      keywords: ['invoice', 'billing', 'statement'],
    },
    {
      title: 'Intelligent Report',
      subtitle: 'Management intelligence, leakage & AI insights',
      category: 'Reports',
      url: '/app/reports/intelligent',
      keywords: ['intelligent', 'report', 'leakage', 'ai', 'analytics', 'revenue'],
      badge: 'Analytics',
    },
    {
      title: 'Help & FAQ',
      subtitle: 'Answers for daily ERP tasks and workflows',
      category: 'Pages',
      url: '/app/faq',
      keywords: ['faq', 'help', 'guide', 'manual', 'how to', 'support', 'question'],
    },
    {
      title: 'About Application',
      subtitle: 'ERP Overview, Fujairah & Ajman branches, credits & AI details',
      category: 'Pages',
      url: '/app/about',
      keywords: [
        'about',
        'application',
        'system',
        'developer',
        'sanu khan',
        'dwtech',
        'desertwhales',
        'zaakiy',
        'fujairah',
        'ajman',
        'credits',
      ],
      badge: 'Info',
    },
    {
      title: 'Terms of Use',
      subtitle: 'Legal terms & service agreement for ERP platform',
      category: 'Pages',
      url: '/app/terms-of-use',
      keywords: ['terms', 'terms of use', 'legal', 'conditions', 'agreement'],
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Data protection, UAE laws & confidentiality policy',
      category: 'Pages',
      url: '/app/privacy-policy',
      keywords: [
        'privacy',
        'privacy policy',
        'gdpr',
        'data',
        'security',
        'confidentiality',
        'legal',
      ],
    },
    {
      title: 'Financial Reports',
      subtitle: 'Operational & audit reports',
      category: 'Pages',
      url: '/app/reports/owner-agreements',
      keywords: ['reports', 'statement', 'financial report', 'audit'],
    },

    // Administration (Super Admin)
    {
      title: 'Branch Management',
      subtitle: 'Branches & office locations',
      category: 'System',
      url: '/app/administration/branches',
      keywords: ['branch', 'branches', 'location', 'office'],
      adminOnly: true,
    },
    {
      title: 'User Management',
      subtitle: 'Staff accounts & system users',
      category: 'System',
      url: '/app/administration/users',
      keywords: ['user', 'users', 'staff', 'employee', 'account'],
      adminOnly: true,
    },
    {
      title: 'Roles & Permissions',
      subtitle: 'Security roles & access control',
      category: 'System',
      url: '/app/administration/roles',
      keywords: ['role', 'roles', 'permission', 'security', 'access'],
      adminOnly: true,
    },
  ];

  filteredSearchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const isAdmin = this.isSuperAdmin();

    const items = this.allSearchItems.filter((item) => !item.adminOnly || isAdmin);

    if (!query) {
      return items.slice(0, 8); // Top quick shortcuts
    }

    const matches = items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSub = item.subtitle?.toLowerCase().includes(query) || false;
      const matchCat = item.category.toLowerCase().includes(query);
      const matchKeyword = item.keywords.some((k) => k.toLowerCase().includes(query));
      return matchTitle || matchSub || matchCat || matchKeyword;
    });

    return matches.length ? matches : this.recordSearchResults(query);
  });

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.setRouteLoading(true);
        this.closeMegaMenu();
        this.closeSearch();
        this.closeShortcutHelp();
        this.closeHelpMenu();
        this.closeLogoBranchDropdown();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.setRouteLoading(false);
      }
    });
  }

  toggleLogoBranchDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.availableBranches().length <= 1) {
      this.router.navigate(['/app/dashboard']);
      return;
    }
    const next = !this.logoBranchDropdownOpen();
    this.closeMegaMenu();
    this.closeSearch();
    this.closeShortcutHelp();
    this.closeHelpMenu();
    this.logoBranchDropdownOpen.set(next);
  }

  closeLogoBranchDropdown(): void {
    this.logoBranchDropdownOpen.set(false);
  }

  selectLogoBranch(branch: Branch): void {
    if (branch.id === this.activeBranch()?.id) {
      this.closeLogoBranchDropdown();
      return;
    }
    this.branchContext.setActiveBranch(branch);
    this.closeLogoBranchDropdown();
    window.location.reload();
  }

  toggleMegaMenu(tab: MegaMenuTab, event: Event): void {
    event.stopPropagation();
    if (this.activeMegaMenu() === tab) {
      this.activeMegaMenu.set(null);
    } else {
      this.activeMegaMenu.set(tab);
      this.closeSearch();
      this.closeHelpMenu();
    }
  }

  closeMegaMenu(): void {
    this.activeMegaMenu.set(null);
  }

  toggleHelpMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const next = !this.helpMenuOpen();
    this.closeMegaMenu();
    this.closeSearch();
    this.closeShortcutHelp();
    this.helpMenuOpen.set(next);
  }

  closeHelpMenu(): void {
    this.helpMenuOpen.set(false);
  }

  toggleShortcutHelp(): void {
    this.shortcutHelpOpen.update((open) => !open);
    this.closeMegaMenu();
    this.closeSearch();
    this.closeHelpMenu();
  }

  closeShortcutHelp(): void {
    this.shortcutHelpOpen.set(false);
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
    this.closeHelpMenu();
    this.closeShortcutHelp();
    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
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

  private recordSearchResults(query: string): PageSearchItem[] {
    const search = encodeURIComponent(query);

    return [
      {
        title: `Search Owners for "${query}"`,
        subtitle: 'Find matching owner records',
        category: 'Customers',
        url: `/app/customers/owners?search=${search}`,
        keywords: ['owner', 'customer', 'record'],
        badge: 'Records',
      },
      {
        title: `Search Tenants for "${query}"`,
        subtitle: 'Find matching tenant records',
        category: 'Customers',
        url: `/app/customers/tenants?search=${search}`,
        keywords: ['tenant', 'customer', 'record'],
        badge: 'Records',
      },
      {
        title: `Search Properties for "${query}"`,
        subtitle: 'Find matching property records',
        category: 'Properties',
        url: `/app/properties?search=${search}`,
        keywords: ['property', 'record'],
        badge: 'Records',
      },
      {
        title: `Search Owner Agreements for "${query}"`,
        subtitle: 'Find matching owner agreements',
        category: 'Agreements',
        url: `/app/owner-agreements?search=${search}`,
        keywords: ['owner agreement', 'contract', 'record'],
        badge: 'Records',
      },
      {
        title: `Search Tenant Agreements for "${query}"`,
        subtitle: 'Find matching tenant agreements',
        category: 'Agreements',
        url: `/app/tenant-agreements?search=${search}`,
        keywords: ['tenant agreement', 'lease', 'record'],
        badge: 'Records',
      },
    ];
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
    const isInput =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    const key = event.key.toLowerCase();
    const shortcutRoutes: Record<string, string> = {
      '1': '/app/dashboard',
      '2': '/app/customers/owners',
      '3': '/app/customers/tenants',
      '4': '/app/properties',
      '5': '/app/owner-agreements',
      '6': '/app/tenant-agreements',
      '7': '/app/accounts/dashboard',
      '8': '/app/reports/owner-agreements',
    };

    if ((event.ctrlKey || event.metaKey) && shortcutRoutes[key]) {
      event.preventDefault();
      this.closeSearch();
      this.router.navigateByUrl(shortcutRoutes[key]);
    } else if (event.key === '/' && !isInput) {
      event.preventDefault();
      this.openSearch();
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
    } else if ((event.ctrlKey || event.metaKey) && key === 'k') {
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
    this.closeShortcutHelp();
    this.closeHelpMenu();
    this.closeLogoBranchDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (
      this.isSearchOpen() &&
      this.searchContainerRef &&
      !this.searchContainerRef.nativeElement.contains(target)
    ) {
      this.closeSearch();
    }

    if (
      this.helpMenuOpen() &&
      this.helpMenuContainerRef &&
      !this.helpMenuContainerRef.nativeElement.contains(target)
    ) {
      this.closeHelpMenu();
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMegaMenu();
      this.closeSearch();
      this.closeShortcutHelp();
      this.closeHelpMenu();
      this.closeLogoBranchDropdown();
    }
  }

  userInitials(): string {
    const name = this.user()?.name || '';
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'BM'
    );
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

  openZaakiy(): void {
    this.router.navigate(['/app/zaakiy']);
  }
}
