import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BmLoadingService } from '../services/bm-loading.service';
import { BmBranchSwitcherComponent } from '../../shared/components/bm-branch-switcher/bm-branch-switcher.component';
import { BmFooterComponent } from '../../shared/components/bm-footer/bm-footer.component';

@Component({
  selector: 'bm-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BmBranchSwitcherComponent, BmFooterComponent],
  template: `
    <div class="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC] relative">
      <!-- Global Top Loading Progress Bar -->
      @if (loadingService.isLoading()) {
        <div class="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/50 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-lime-400 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)] w-full"></div>
        </div>
      }

      <!-- Sidebar Navigation Rail -->
      <aside
        class="bg-[#132a13] text-white flex flex-col shrink-0 h-full border-r border-[#0b190b] z-20 transition-all duration-300 shadow-xl"
        [class.w-full]="mobileMenuOpen()"
        [class.md:w-64]="!isCollapsed()"
        [class.md:w-20]="isCollapsed()"
      >
        <!-- Brand Header -->
        <div class="p-4 flex items-center justify-between border-b border-[#0f220f] shrink-0 h-16">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#31572c] via-[#4f772d] to-[#90a955] flex items-center justify-center font-bold text-[#ecf39e] text-base tracking-wider shadow-md shrink-0">
              BM
            </div>
            @if (!isCollapsed() || isMobile()) {
              <div class="overflow-hidden transition-all duration-300 whitespace-nowrap">
                <div class="font-semibold text-white tracking-wide text-sm leading-tight">Baithul Madeena</div>
                <div class="text-[10px] text-[#ecf39e] font-medium tracking-wider uppercase">Real Estate ERP</div>
              </div>
            }
          </div>

          <!-- Mobile Menu Toggle -->
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="md:hidden text-[#d3ddbb] hover:text-white p-1 rounded-lg hover:bg-[#1e351b]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Desktop Collapse Toggle Button -->
          <button
            type="button"
            (click)="toggleDesktopCollapse()"
            [title]="isCollapsed() ? 'Expand Sidebar' : 'Collapse Sidebar'"
            class="hidden md:flex text-[#d3ddbb] hover:text-white p-1.5 rounded-lg hover:bg-[#1e351b] transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300" [class.rotate-180]="isCollapsed()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav
          class="p-3 flex-1 space-y-1 overflow-y-auto overflow-x-hidden"
          [class.hidden]="!mobileMenuOpen() && isMobile()"
          [class.block]="mobileMenuOpen() || !isMobile()"
        >
          <!-- OPERATIONAL SCOPE -->
          @if (!isCollapsed() || isMobile()) {
            <div class="px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">
              Operational Scope
            </div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/dashboard"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Dashboard' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Dashboard</span>
            }
          </a>

          <!-- ASSETS -->
          @if (!isCollapsed() || isMobile()) {
            <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">Assets</div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/customers/owners"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Owners' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Owners</span>
            }
          </a>

          <a
            routerLink="/app/customers/tenants"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Tenants' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Tenants</span>
            }
          </a>

          <a
            routerLink="/app/properties"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Properties' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Properties</span>
            }
          </a>

          <!-- ACCOUNTS -->
          @if (!isCollapsed() || isMobile()) {
            <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">Accounts</div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/accounts/dashboard"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Accounts Dashboard' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Dashboard</span>
            }
          </a>

          <a
            routerLink="/app/accounts/inward"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Inward Receipts' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3 3m0 0l3-3m-3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Inward Receipts</span>
            }
          </a>

          <a
            routerLink="/app/accounts/outward"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Outward Vouchers' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3-3m0 0l-3 3m3-3v6m0-13a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Outward Vouchers</span>
            }
          </a>

          <a
            routerLink="/app/accounts/petty-cash"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Petty Cash Daybook' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Petty Cash Daybook</span>
            }
          </a>

          <a
            routerLink="/app/accounts/reports"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Financial Reports' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Reports</span>
            }
          </a>

          <!-- MAINTENANCE -->
          @if (!isCollapsed() || isMobile()) {
            <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">Maintenance</div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/maintenance/work-orders"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Work Orders' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Work Orders</span>
            }
          </a>

          <a
            routerLink="/app/maintenance/vendors"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Vendors' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Vendors</span>
            }
          </a>

          <a
            routerLink="/app/maintenance/inventory"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Inventory' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Inventory</span>
            }
          </a>

          <!-- BILLING -->
          @if (!isCollapsed() || isMobile()) {
            <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">Billing</div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/billing/quotations"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Quotations' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h4m5 6H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Quotations</span>
            }
          </a>

          <a
            routerLink="/app/billing/invoices"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Invoices' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Invoices</span>
            }
          </a>

          <!-- LEASING & CONTRACTS -->
          @if (!isCollapsed() || isMobile()) {
            <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">
              Leasing & Contracts
            </div>
          } @else {
            <div class="my-2 border-t border-[#1e351b]"></div>
          }

          <a
            routerLink="/app/owner-agreements"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Owner Agreements' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Owner Agreements</span>
            }
          </a>

          <a
            routerLink="/app/tenant-agreements"
            routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
            (click)="closeMobileMenu()"
            [title]="isCollapsed() ? 'Tenant Agreements' : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
            [class.justify-center]="isCollapsed() && !isMobile()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            @if (!isCollapsed() || isMobile()) {
              <span class="truncate">Tenant Agreements</span>
            }
          </a>

          <!-- SYSTEM ADMINISTRATION (Super Admin Only) -->
          @if (isSuperAdmin()) {
            @if (!isCollapsed() || isMobile()) {
              <div class="pt-3 px-3 py-2 text-[10px] font-bold text-[#a0cc9b] uppercase tracking-wider whitespace-nowrap">
                Administration
              </div>
            } @else {
              <div class="my-2 border-t border-[#1e351b]"></div>
            }

            <a
              routerLink="/app/administration/branches"
              routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
              (click)="closeMobileMenu()"
              [title]="isCollapsed() ? 'Branches' : ''"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
              [class.justify-center]="isCollapsed() && !isMobile()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              @if (!isCollapsed() || isMobile()) {
                <span class="truncate">Branches</span>
              }
            </a>

            <a
              routerLink="/app/administration/users"
              routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
              (click)="closeMobileMenu()"
              [title]="isCollapsed() ? 'Users' : ''"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
              [class.justify-center]="isCollapsed() && !isMobile()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              @if (!isCollapsed() || isMobile()) {
                <span class="truncate">Users</span>
              }
            </a>

            <a
              routerLink="/app/administration/roles"
              routerLinkActive="bg-[#31572c] text-white font-semibold border-l-4 border-[#ecf39e]"
              (click)="closeMobileMenu()"
              [title]="isCollapsed() ? 'Roles' : ''"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#d3ddbb] hover:bg-[#1e351b]/80 hover:text-white transition-all group"
              [class.justify-center]="isCollapsed() && !isMobile()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#90a955] group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              @if (!isCollapsed() || isMobile()) {
                <span class="truncate">Roles</span>
              }
            </a>
          }
        </nav>

        <!-- User Footer Info -->
        <div class="p-3 border-t border-[#0f220f] bg-[#0b190b]/80 flex items-center justify-between shrink-0 h-16">
          <div class="flex items-center gap-3 overflow-hidden">
            <div
              [title]="user()?.name || 'User'"
              class="w-8 h-8 rounded-full bg-[#31572c] text-[#ecf39e] font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm border border-[#90a955]/30"
            >
              {{ userInitials() }}
            </div>
            @if (!isCollapsed() || isMobile()) {
              <div class="overflow-hidden whitespace-nowrap">
                <div class="text-xs font-medium text-white truncate">{{ user()?.name }}</div>
                <div class="text-[10px] text-[#a0cc9b] truncate capitalize">{{ primaryRole() }}</div>
              </div>
            }
          </div>

          <button
            type="button"
            (click)="logout()"
            title="Logout"
            class="text-[#d3ddbb] hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1e351b] transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Workspace Area -->
      <main class="flex-1 flex flex-col h-full min-w-0 bg-[#F8FAFC] overflow-hidden">
        <!-- Header Bar -->
        <header class="h-16 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div class="flex items-center gap-3">
            <!-- Sidebar Collapse Toggle Button in Top Nav -->
            <button
              type="button"
              (click)="toggleDesktopCollapse()"
              [title]="isCollapsed() ? 'Expand Sidebar Navigation' : 'Collapse Sidebar Navigation'"
              class="hidden md:flex text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h16" />
              </svg>
            </button>
            <h2 class="text-sm font-semibold text-[#0b190b] tracking-tight">Baithul Madeena Workspace</h2>
          </div>

          <div class="flex items-center gap-4">
            <bm-branch-switcher></bm-branch-switcher>
          </div>
        </header>

        <!-- Route Content Slot -->
        <div class="p-6 md:p-8 xl:p-10 flex-1 overflow-y-auto flex flex-col justify-between">
          <div class="flex-1">
            <router-outlet></router-outlet>
          </div>

          <!-- Application Common Footer -->
          <div class="mt-8 pt-4 border-t border-slate-200/80">
            <bm-footer></bm-footer>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  loadingService = inject(BmLoadingService);

  user = this.authService.currentUser;
  isSuperAdmin = this.authService.isSuperAdmin;

  mobileMenuOpen = signal(false);
  isCollapsed = signal<boolean>(localStorage.getItem('bm_sidebar_collapsed') === 'true');

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.setRouteLoading(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.setRouteLoading(false);
      }
    });
  }

  toggleDesktopCollapse(): void {
    this.isCollapsed.update((v) => !v);
    localStorage.setItem('bm_sidebar_collapsed', String(this.isCollapsed()));
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
