import { describe, beforeEach, it, expect } from 'vitest';
import { BranchContextService } from './branch-context.service';
import { Branch } from './branch.models';

describe('BranchContextService', () => {
  let service: BranchContextService;

  const mockBranches: Branch[] = [
    {
      id: 1,
      code: 'DXB',
      name: 'Dubai',
      timezone: 'Asia/Dubai',
      currency_code: 'AED',
      status: 'active',
    },
    {
      id: 2,
      code: 'AUH',
      name: 'Abu Dhabi',
      timezone: 'Asia/Dubai',
      currency_code: 'AED',
      status: 'active',
    },
  ];

  beforeEach(() => {
    service = new BranchContextService();
    localStorage.clear();
  });

  it('should initialize with null active branch', () => {
    expect(service.activeBranch()).toBeNull();
  });

  it('should set available branches and select first branch as default', () => {
    service.setAvailableBranches(mockBranches, ['branch_admin']);
    expect(service.availableBranches().length).toBe(2);
    expect(service.activeBranch()?.id).toBe(1);
  });

  it('should restore stored branch from localStorage if available', () => {
    localStorage.setItem('bm_active_branch_id', '2');
    service.setAvailableBranches(mockBranches, ['branch_admin']);
    expect(service.activeBranch()?.id).toBe(2);
  });

  it('should update active branch and notify branchChanged$ subscriber', () => {
    service.setAvailableBranches(mockBranches, ['super_admin']);
    let emittedBranch: Branch | null = null;
    service.branchChanged$.subscribe((b) => (emittedBranch = b));

    service.setActiveBranch(mockBranches[1]);
    expect(service.activeBranch()?.id).toBe(2);
    expect((emittedBranch as Branch | null)?.id).toBe(2);
    expect(localStorage.getItem('bm_active_branch_id')).toBe('2');
  });

  it('should clear context on logout', () => {
    service.setAvailableBranches(mockBranches, ['branch_admin']);
    service.clearContext();
    expect(service.activeBranch()).toBeNull();
    expect(service.availableBranches().length).toBe(0);
  });
});
