import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ZaakiyActionProposal } from '../../../core/api/zaakiy-api.service';
import { ZaakiyActionProposalCardComponent } from './zaakiy-action-proposal-card.component';

describe('ZaakiyActionProposalCardComponent', () => {
  const pendingProposal = (): ZaakiyActionProposal => ({
    proposal_id: 'uuid-1',
    action_type: 'create_work_order',
    title: 'Create Maintenance Work Order',
    summary: 'Create normal work order "Water pipe leak" for P-101',
    branch_name: 'Dubai Branch',
    risk_level: 'medium',
    status: 'pending',
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    fields: [
      { key: 'property', label: 'Property', value: 'P-101 — Flat 101' },
      { key: 'vendor', label: 'Vendor', value: 'Al Noor Maintenance' },
    ],
    editable_fields: [
      { key: 'title', label: 'Title', type: 'text', value: 'Water pipe leak' },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        value: 'normal',
        options: ['low', 'normal', 'high', 'urgent'],
      },
    ],
  });

  const create = (proposal: ZaakiyActionProposal, errorMessage: string | null = null) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ZaakiyActionProposalCardComponent],
    });
    const fixture = TestBed.createComponent(ZaakiyActionProposalCardComponent);
    fixture.componentInstance.proposal = proposal;
    fixture.componentInstance.errorMessage = errorMessage;
    fixture.detectChanges();
    return fixture;
  };

  it('emits edited overrides on Confirm and transitions to executed Open Record CTA', () => {
    const fixture = create(pendingProposal());
    const confirmSpy = vi.fn();
    const navigateSpy = vi.fn();
    fixture.componentInstance.onConfirm.subscribe(confirmSpy);
    fixture.componentInstance.onNavigate.subscribe(navigateSpy);

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    expect(select).not.toBeNull();
    select.value = 'urgent';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const confirmBtn = Array.from(el.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Confirm & Execute'),
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeDefined();
    confirmBtn.click();

    expect(confirmSpy).toHaveBeenCalledWith({
      proposalId: 'uuid-1',
      overrides: { priority: 'urgent' },
    });

    // Transition to executed state with route
    fixture.componentInstance.proposal = {
      ...pendingProposal(),
      status: 'executed',
      result_label: 'Work Order WO-2026-000005',
      result_route: '/app/maintenance/work-orders/5',
    };
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();

    const openBtn = Array.from(el.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Open Record'),
    ) as HTMLButtonElement;
    expect(openBtn).toBeDefined();
    openBtn.click();
    expect(navigateSpy).toHaveBeenCalledWith('/app/maintenance/work-orders/5');

    const confirmAfter = Array.from(el.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Confirm & Execute'),
    );
    expect(confirmAfter).toBeUndefined();
  });

  it('emits proposalId on Reject and shows inline error banner when provided', () => {
    const fixture = create(pendingProposal(), 'Property belongs to another branch.');
    const rejectSpy = vi.fn();
    fixture.componentInstance.onReject.subscribe(rejectSpy);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Property belongs to another branch.');

    const rejectBtn = Array.from(el.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Reject'),
    ) as HTMLButtonElement;
    expect(rejectBtn).toBeDefined();
    rejectBtn.click();

    expect(rejectSpy).toHaveBeenCalledWith('uuid-1');
  });
});
