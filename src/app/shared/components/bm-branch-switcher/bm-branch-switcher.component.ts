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
        class="inline-flex items-center gap-2 px-3.5 h-[36px] rounded-xl bg-[#F1F1EE] border border-[#DDDED9] text-xs font-medium text-[#111210] hover:bg-[#E9EAE6] transition-all shadow-xs"
        [class.cursor-default]="availableBranches().length <= 1"
      >
        <span class="w-2 h-2 rounded-full bg-[#247454] animate-pulse shrink-0"></span>
        <span class="font-semibold text-[#12372A]">{{ activeBranch()?.code || 'N/A' }}</span>
        <span class="text-[#777B74]">•</span>
        <span class="max-w-[130px] truncate text-[#292B28] font-medium">{{ activeBranch()?.name || 'No Branch' }}</span>

        @if (availableBranches().length > 1) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#777B74] ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        }
      </button>

      @if (isOpen() && availableBranches().length > 1) {
        <div
          class="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#DDDED9] shadow-lg py-2 z-50 animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <div class="px-4 py-2 border-b border-[#F1F1EE] text-[10px] font-bold text-[#777B74] uppercase tracking-wider">
            Switch Operating Branch
          </div>

          <div class="max-h-60 overflow-y-auto py-1">
            @for (branch of availableBranches(); track branch.id) {
              <button
                type="button"
                (click)="selectBranch(branch)"
                class="w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#F1F1EE] transition-colors"
                [class.bg-[#E2F3E9]]="branch.id === activeBranch()?.id"
                [class.font-semibold]="branch.id === activeBranch()?.id"
                [class.text-[#12372A]]="branch.id === activeBranch()?.id"
                [class.text-[#292B28]]="branch.id !== activeBranch()?.id"
              >
                <div>
                  <span class="font-bold mr-1.5 text-[#247454]">[{{ branch.code }}]</span>
                  <span>{{ branch.name }}</span>
                </div>
                @if (branch.id === activeBranch()?.id) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#247454]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
