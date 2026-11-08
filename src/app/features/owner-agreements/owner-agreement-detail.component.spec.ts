import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { OwnerAgreementDetailComponent } from './owner-agreement-detail.component';

describe('OwnerAgreementDetailComponent printing', () => {
  it('delegates printing to the shared standalone print sheet', () => {
    const injector = Injector.create({
      providers: [
        { provide: OwnerAgreementsApiService, useValue: {} },
        { provide: BranchContextService, useValue: { activeBranch: () => null } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: {} },
      ],
    });
    const component = runInInjectionContext(injector, () => new OwnerAgreementDetailComponent());
    const openPrintWindow = vi.fn();
    (component as any).printSheet = { openPrintWindow };

    component.printAgreement();

    expect(openPrintWindow).toHaveBeenCalledOnce();
  });
});
