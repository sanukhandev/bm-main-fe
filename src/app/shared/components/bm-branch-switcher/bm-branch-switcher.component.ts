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
        class="inline-flex items-center gap-2 px-3 h-[36px] rounded-[10px] bg-[#FBFAF7] border border-[#D8D4CB] text-xs font-semibold text-[#1B1E1C] hover:bg-[#EAE6DE] transition-all shadow-2xs"
        [class.cursor-default]="availableBranches().length <= 1"
      >
        <span class="w-2 h-2 rounded-full bg-[#285746] shrink-0"></span>
        <span class="font-bold text-[#193D32]">{{ activeBranch()?.code || 'N/A' }}</span>
        <span class="text-[#74776F]">•</span>
        <span class="max-w-[130px] truncate text-[#343834] font-medium">{{ activeBranch()?.name || 'No Branch' }}</span>

        @if (availableBranches().length > 1) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#74776F] ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        }
      </button>

      @if (isOpen() && availableBranches().length > 1) {
        <div
          class="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-[#D8D4CB] shadow-lg py-2 z-50 animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <div class="px-4 py-2 border-b border-[#F1F1EE] text-[10px] font-bold text-[#74776F] uppercase tracking-wider">
            Switch Operating Branch
          </div>

          <div class="max-h-60 overflow-y-auto py-1">
            @for (branch of availableBranches(); track branch.id) {
              <button
                type="button"
                (click)="selectBranch(branch)"
                class="w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#F1F1EE] transition-colors"
                [class.bg-[#DDE5DD]]="branch.id === activeBranch()?.id"
                [class.font-semibold]="branch.id === activeBranch()?.id"
                [class.text-[#193D32]]="branch.id === activeBranch()?.id"
                [class.text-[#343834]]="branch.id !== activeBranch()?.id"
              >
                <div>
                  <span class="font-bold mr-1.5 text-[#285746]">[{{ branch.code }}]</span>
                  <span>{{ branch.name }}</span>
                </div>
                @if (branch.id === activeBranch()?.id) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#285746]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
