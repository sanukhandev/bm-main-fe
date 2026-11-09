import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { TenantAgreementDetailComponent } from './tenant-agreement-detail.component';

describe('TenantAgreementDetailComponent printing', () => {
  it('delegates printing to the shared standalone print sheet', () => {
    const injector = Injector.create({
      providers: [
        { provide: TenantAgreementsApiService, useValue: {} },
        { provide: BranchContextService, useValue: { activeBranch: () => null } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: {} },
      ],
    });
    const component = runInInjectionContext(injector, () => new TenantAgreementDetailComponent());
    const openPrintWindow = vi.fn();
    (component as any).printSheet = { openPrintWindow };

    component.printAgreement();

    expect(openPrintWindow).toHaveBeenCalledOnce();
  });
});
