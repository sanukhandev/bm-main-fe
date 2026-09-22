import { Injectable, signal, computed } from '@angular/core';
import { Branch } from './branch.models';
import { Subject } from 'rxjs';

const ACTIVE_BRANCH_STORAGE_KEY = 'bm_active_branch_id';

@Injectable({
  providedIn: 'root',
})
export class BranchContextService {
  private activeBranchSignal = signal<Branch | null>(null);
  private availableBranchesSignal = signal<Branch[]>([]);
  private isSuperAdminSignal = signal<boolean>(false);

  readonly activeBranch = this.activeBranchSignal.asReadonly();
  readonly availableBranches = this.availableBranchesSignal.asReadonly();
  readonly isSuperAdmin = this.isSuperAdminSignal.asReadonly();

  readonly activeBranchId = computed(() => this.activeBranchSignal()?.id ?? null);

  // Subject to notify subscribers when branch changes so they can invalidate caches / refetch data
  readonly branchChanged$ = new Subject<Branch | null>();

  setAvailableBranches(branches: Branch[], userRoles: string[] = []): void {
    this.availableBranchesSignal.set(branches);
    this.isSuperAdminSignal.set(userRoles.includes('super_admin'));

    if (branches.length === 0) {
      this.activeBranchSignal.set(null);
      return;
    }

    // Attempt to restore stored branch ID if permitted
    const savedBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    let matchedBranch: Branch | undefined;

    if (savedBranchId) {
      matchedBranch = branches.find((b) => b.id === Number(savedBranchId));
    }

    if (!matchedBranch) {
      matchedBranch = branches[0];
    }

    this.setActiveBranch(matchedBranch, false);
  }

  setActiveBranch(branch: Branch, emitChange = true): void {
    if (this.activeBranchSignal()?.id === branch.id && !emitChange) {
      return;
    }

    this.activeBranchSignal.set(branch);
    localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, String(branch.id));

    if (emitChange) {
      this.branchChanged$.next(branch);
    }
  }

  clearContext(): void {
    this.activeBranchSignal.set(null);
    this.availableBranchesSignal.set([]);
    this.isSuperAdminSignal.set(false);
    localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
  }
}
