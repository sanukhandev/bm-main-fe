import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { OwnerAgreementDetailComponent } from './owner-agreement-detail.component';

describe('OwnerAgreementDetailComponent printing', () => {
  it('opens the browser print dialog after the print sheet has rendered', () => {
    const injector = Injector.create({
      providers: [
        { provide: OwnerAgreementsApiService, useValue: {} },
        { provide: BranchContextService, useValue: { activeBranch: () => null } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: {} },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new OwnerAgreementDetailComponent(),
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
