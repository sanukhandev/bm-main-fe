import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchContextService } from '../../../core/branch-context/branch-context.service';
import { Branch } from '../../../core/branch-context/branch.models';

@Component({
  selector: 'bm-branch-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        (click)="toggleOpen()"
        [disabled]="availableBranches().length <= 1"
        class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#0b190b] hover:bg-[#E2E8F0] transition-all shadow-sm"
        [class.cursor-default]="availableBranches().length <= 1"
      >
        <span class="w-2 h-2 rounded-full bg-[#4f772d] animate-pulse"></span>
        <span class="font-semibold text-[#132a13]">{{ activeBranch()?.code || 'N/A' }}</span>
        <span class="text-[#576633]">-</span>
        <span class="max-w-[120px] truncate text-[#1e351b]">{{ activeBranch()?.name || 'No Branch' }}</span>

        @if (availableBranches().length > 1) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#576633]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        }
      </button>

      @if (isOpen() && availableBranches().length > 1) {
        <div
          class="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg py-2 z-50 animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <div class="px-4 py-2 border-b border-[#F1F5F9] text-[11px] font-semibold text-[#576633] uppercase tracking-wider">
            Switch Branch
          </div>

          <div class="max-h-60 overflow-y-auto py-1">
            @for (branch of availableBranches(); track branch.id) {
              <button
                type="button"
                (click)="selectBranch(branch)"
                class="w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#F1F5F9] transition-colors"
                [class.bg-[#d0e6cd]/60]="branch.id === activeBranch()?.id"
                [class.font-semibold]="branch.id === activeBranch()?.id"
                [class.text-[#132a13]]="branch.id === activeBranch()?.id"
                [class.text-[#1e351b]]="branch.id !== activeBranch()?.id"
              >
                <div>
                  <span class="font-semibold mr-1.5 text-[#31572c]">[{{ branch.code }}]</span>
                  <span>{{ branch.name }}</span>
                </div>
                @if (branch.id === activeBranch()?.id) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#31572c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class BmBranchSwitcherComponent {
  private branchContext = inject(BranchContextService);

  activeBranch = this.branchContext.activeBranch;
  availableBranches = this.branchContext.availableBranches;
  isOpen = signal(false);

  toggleOpen(): void {
    if (this.availableBranches().length > 1) {
      this.isOpen.update((v) => !v);
    }
  }

  selectBranch(branch: Branch): void {
    if (branch.id === this.activeBranch()?.id) {
      this.isOpen.set(false);
      return;
    }

    this.branchContext.setActiveBranch(branch);
    this.isOpen.set(false);
    window.location.reload();
  }
}
