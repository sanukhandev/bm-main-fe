import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { TenantAgreementDetailComponent } from './tenant-agreement-detail.component';

describe('TenantAgreementDetailComponent printing', () => {
  it('opens the browser print dialog after the print sheet has rendered', () => {
    const injector = Injector.create({
      providers: [
        { provide: TenantAgreementsApiService, useValue: {} },
        { provide: BranchContextService, useValue: { activeBranch: () => null } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: {} },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new TenantAgreementDetailComponent(),
    );
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    vi.useFakeTimers();

    component.printAgreement();

    expect(print).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(print).toHaveBeenCalledOnce();

    vi.useRealTimers();
    print.mockRestore();
  });
});
