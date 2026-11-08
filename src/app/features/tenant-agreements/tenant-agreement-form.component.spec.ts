import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { OwnerAgreement } from '../../shared/models/agreement.models';
import { TenantAgreementFormComponent } from './tenant-agreement-form.component';

describe('TenantAgreementFormComponent coverage override', () => {
  it('pauses creation for an authorized coverage warning and submits the reason after confirmation', () => {
    const api = {
      createAgreement: vi.fn(() => of({ data: {} })),
      updateAgreement: vi.fn(),
    };
    const injector = Injector.create({
      providers: [
        FormBuilder,
        { provide: TenantAgreementsApiService, useValue: api },
        { provide: OwnerAgreementsApiService, useValue: {} },
        { provide: CustomersApiService, useValue: {} },
        { provide: PropertiesApiService, useValue: { getAvailableProperties: vi.fn(() => of({ data: [] })) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new TenantAgreementFormComponent(),
    );

    component.ownerAgreements.set([
      { id: 1, start_date: '2026-01-01', end_date: '2026-12-31' } as OwnerAgreement,
    ]);
    component.agreementForm.patchValue({
      tenant_customer_id: '10',
      source_owner_agreement_id: '1',
      selected_property_ids: [20],
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      total_amount: 24000,
      payment_count: 1,
      payment_frequency: 'monthly',
      payment_mode: 'cash',
    });
    component.scheduleDetails.set({ 1: { category: 'rent', particulars: 'Annual rent' } });

    component.onSubmit();

    expect(api.createAgreement).not.toHaveBeenCalled();
    expect((component as any).coverageOverrideDialogOpen()).toBe(true);

    component.agreementForm.get('coverage_override_reason')?.setValue('Owner renewal is pending.');
    component.confirmCoverageOverride();

    expect(api.createAgreement).toHaveBeenCalledWith(
      expect.objectContaining({
        coverage_override: true,
        coverage_override_reason: 'Owner renewal is pending.',
      }),
    );
  });

  it('keeps selected properties when a date change only exceeds owner coverage', () => {
    const injector = Injector.create({
      providers: [
        FormBuilder,
        { provide: TenantAgreementsApiService, useValue: { createAgreement: vi.fn(), updateAgreement: vi.fn() } },
        { provide: OwnerAgreementsApiService, useValue: {} },
        { provide: CustomersApiService, useValue: {} },
        { provide: PropertiesApiService, useValue: { getAvailableProperties: vi.fn(() => of({ data: [] })) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new TenantAgreementFormComponent(),
    );

    component.ownerAgreements.set([
      { id: 1, start_date: '2026-01-01', end_date: '2026-12-31' } as OwnerAgreement,
    ]);
    component.agreementForm.patchValue({
      source_owner_agreement_id: '1',
      selected_property_ids: [20],
      start_date: '2026-01-01',
      end_date: '2027-12-31',
    });

    component.onDateChange();

    expect(component.agreementForm.value.selected_property_ids).toEqual([20]);
  });

  it('does not make the coverage warning depend on an aggregate client permission list', () => {
    const injector = Injector.create({
      providers: [
        FormBuilder,
        { provide: TenantAgreementsApiService, useValue: { createAgreement: vi.fn(), updateAgreement: vi.fn() } },
        { provide: OwnerAgreementsApiService, useValue: {} },
        { provide: CustomersApiService, useValue: {} },
        { provide: PropertiesApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    const component = runInInjectionContext(
      injector,
      () => new TenantAgreementFormComponent(),
    );

    component.ownerAgreements.set([
      { id: 1, start_date: '2026-01-01', end_date: '2026-12-31' } as OwnerAgreement,
    ]);
    component.agreementForm.patchValue({
      tenant_customer_id: '10',
      source_owner_agreement_id: '1',
      selected_property_ids: [20],
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      total_amount: 24000,
      payment_count: 1,
      payment_frequency: 'monthly',
      payment_mode: 'cash',
    });
    component.scheduleDetails.set({ 1: { category: 'rent', particulars: 'Annual rent' } });

    component.onSubmit();

    expect((component as any).coverageOverrideDialogOpen()).toBe(true);
    expect((component as any).serverError()).toBeNull();
  });
});
