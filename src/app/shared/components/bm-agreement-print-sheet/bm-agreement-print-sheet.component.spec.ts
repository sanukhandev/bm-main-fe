import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Branch } from '../../../core/branch-context/branch.models';
import { Customer } from '../../models/customer.models';
import { OwnerAgreement, TenantAgreement } from '../../models/agreement.models';
import { Property } from '../../models/property.models';
import { BmAgreementPrintSheetComponent } from './bm-agreement-print-sheet.component';

describe('BmAgreementPrintSheetComponent', () => {
  let fixture: ComponentFixture<BmAgreementPrintSheetComponent>;

  const branch: Branch = {
    id: 7,
    code: 'DXB',
    name: 'Dubai Branch',
    legal_name: 'Baithul Madeena Real Estate Dubai',
    phone: '+971 4 000 0000',
    email: 'dubai@example.test',
    address_line_1: 'Business Bay',
    address_line_2: null,
    city: 'Dubai',
    state_or_emirate: 'Dubai',
    timezone: 'Asia/Dubai',
    currency_code: 'AED',
    status: 'active',
  };

  const property: Property = {
    id: 10,
    branch_id: 7,
    owner_customer_id: 2,
    property_code: 'V-20M',
    unit_number: '3 Rooms Villa',
    property_type: 'villa',
    name: '20M - Ali Juma Villa',
    building_name: 'Lulu Manager Villa',
    address_line_1: 'Faseel',
    address_line_2: null,
    city: 'Fujairah',
    state_or_emirate: 'Fujairah',
    country_code: 'AE',
    area: 'Faseel',
    electricity_provider: 'Etihad',
    electricity_account_number: '420280000417',
    cooling_provider: null,
    cooling_account_number: null,
    gas_provider: null,
    gas_connection_type: null,
    gas_connection_number: null,
    utility_details: [
      {
        type: 'electricity',
        provider: 'Etihad',
        account_number: '420280000417',
        connection_type: 'Single',
      },
      { type: 'furniture', details: 'Furnished' },
    ],
    status: 'active',
    notes: 'Family accommodation',
  };

  const customer: Customer = {
    id: 2,
    branch_id: 7,
    customer_code: 'CUS-2',
    customer_type: 'individual',
    display_name: 'Gurpreet Singh Surinder Singh',
    legal_name: null,
    phone: '0504484347',
    phone_numbers: null,
    representative: null,
    email: 'tenant@example.test',
    tax_registration_no: null,
    identity_no: '784-1975-3063538-8',
    identity_verified: true,
    company_registration_no: null,
    address_line_1: 'Faseel',
    address_line_2: null,
    city: 'Fujairah',
    state_or_emirate: 'Fujairah',
    country_code: 'AE',
    status: 'active',
    notes: null,
  };

  const agreement: TenantAgreement = {
    id: 20,
    branch_id: 7,
    agreement_no: 'T-20',
    file_no: '20M',
    tenant_customer_id: 2,
    tenant: customer,
    properties: [{ property_id: 10, property }],
    start_date: '2026-04-20',
    end_date: '2027-04-19',
    total_amount: 55000,
    currency_code: 'AED',
    payment_count: 4,
    payment_frequency: 'monthly',
    payment_mode: 'cheque',
    terms_text: 'Payments: 3150/- (4 Cheques)',
    notes: 'Electricity and water included.',
    status: 'approved',
    installments: [
      {
        id: 1,
        installment_no: 1,
        due_date: '2026-05-01',
        amount: 13750,
        paid_amount: 0,
        balance: 13750,
        payment_mode: 'cheque',
        category: 'rent',
        particulars: 'First rent cheque',
        direction: 'inward',
        status: 'pending',
      },
    ],
    additional_payments: [
      {
        category: 'security',
        particulars: 'Deposit',
        direction: 'inward',
        amount: 0,
        due_date: '2026-04-20',
        payment_mode: 'cash',
        terms: 'Nil',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmAgreementPrintSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BmAgreementPrintSheetComponent);
  });

  it('renders branch, party, property utility, payment, and notes data for a tenant agreement', () => {
    const component = fixture.componentInstance as any;
    component.agreement = agreement;
    component.branch = branch;
    component.isOwnerAgreement = false;
    component.firstPartyName = 'BAITHUL MADEENA REAL ESTATE';
    component.firstPartyRole = 'Lessor / المؤجر';
    component.secondPartyName = customer.display_name;
    component.secondPartyRole = 'Tenant / المستأجر';
    component.properties = agreement.properties;
    component.firstParty = { name: component.firstPartyName, role: component.firstPartyRole };
    component.secondParty = {
      name: customer.display_name,
      role: component.secondPartyRole,
      customer,
    };

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Dubai Branch');
    expect(text).toContain('BAITHUL MADEENA REAL ESTATE');
    expect(text).toContain('Gurpreet Singh Surinder Singh');
    expect(text).toContain('Etihad');
    expect(text).toContain('Furnished');
    expect(text).toContain('First rent cheque');
    expect(text).toContain('Electricity and water included.');
    expect(text).toContain('Office 000, Business Bay, Dubai, United Arab Emirates');
    expect(text).toContain('If the lease contract includes electricity and water');
  });

  it('renders the owner party and owner-specific terms for an owner agreement', () => {
    const ownerAgreement = {
      ...agreement,
      agreement_no: 'L-3',
      owner_customer_id: 2,
      owner: customer,
    } as OwnerAgreement;
    const component = fixture.componentInstance as any;
    component.agreement = ownerAgreement;
    component.branch = branch;
    component.isOwnerAgreement = true;
    component.firstPartyName = customer.display_name;
    component.firstPartyRole = 'Owner / المالك';
    component.secondPartyName = 'BAITHUL MADEENA REAL ESTATE';
    component.secondPartyRole = 'Tenant / المستأجر';
    component.properties = [property];
    component.firstParty = {
      name: customer.display_name,
      role: component.firstPartyRole,
      customer,
    };
    component.secondParty = { name: component.secondPartyName, role: component.secondPartyRole };

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Gurpreet Singh Surinder Singh');
    expect(text).toContain('BAITHUL MADEENA REAL ESTATE');
    expect(text).toContain(
      'The tenant has the right to lease the property without referring to the lessor.',
    );
    expect(text).toContain(
      'The lessor does not have the right to cancel the lease without the consent of the tenant.',
    );
  });

  it('renders safe placeholders when optional branch, party, and property data is missing', () => {
    const component = fixture.componentInstance as any;
    component.agreement = {
      ...agreement,
      properties: undefined,
      installments: undefined,
      additional_payments: undefined,
    };
    component.branch = null;
    component.isOwnerAgreement = false;
    component.firstPartyName = 'First fallback party';
    component.firstPartyRole = 'First role';
    component.secondPartyName = 'Second fallback party';
    component.secondPartyRole = 'Second role';
    component.properties = [];
    component.firstParty = null;
    component.secondParty = null;

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('First fallback party');
    expect(text).toContain('Second fallback party');
    expect(text).toContain('—');
  });

  it('falls back to the agreement branch id and omits an empty amenities section', () => {
    const component = fixture.componentInstance as any;
    component.agreement = agreement;
    component.branch = null;
    component.isOwnerAgreement = false;
    component.firstPartyName = 'BAITHUL MADEENA REAL ESTATE';
    component.firstPartyRole = 'Lessor / المؤجر';
    component.secondPartyName = customer.display_name;
    component.secondPartyRole = 'Tenant / المستأجر';
    component.properties = [
      {
        ...property,
        utility_details: null,
        electricity_provider: null,
        electricity_account_number: null,
        notes: null,
      },
    ];
    component.firstParty = { name: component.firstPartyName, role: component.firstPartyRole };
    component.secondParty = {
      name: customer.display_name,
      role: component.secondPartyRole,
      customer,
    };

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Branch #7');
    expect(text).not.toContain('AMENITIES AND SERVICES');
  });

  it('opens a standalone bilingual A4 document and prints after it loads', () => {
    const component = fixture.componentInstance as any;
    component.agreement = agreement;
    component.branch = branch;
    component.isOwnerAgreement = false;
    component.firstPartyName = 'BAITHUL MADEENA REAL ESTATE';
    component.firstPartyRole = 'Lessor / المؤجر';
    component.secondPartyName = customer.display_name;
    component.secondPartyRole = 'Tenant / المستأجر';
    component.properties = agreement.properties;
    component.firstParty = { name: component.firstPartyName, role: component.firstPartyRole };
    component.secondParty = {
      name: customer.display_name,
      role: component.secondPartyRole,
      customer,
    };
    fixture.detectChanges();

    let html = '';
    const print = vi.fn();
    const printWindow = {
      document: {
        open: vi.fn(),
        write: vi.fn((value: string) => {
          html = value;
        }),
        close: vi.fn(),
      },
      addEventListener: vi.fn((_event: string, callback: EventListener) =>
        callback(new Event('load')),
      ),
      focus: vi.fn(),
      print,
    } as unknown as Window;
    const open = vi.spyOn(window, 'open').mockReturnValue(printWindow);

    component.openPrintWindow();

    expect(open).toHaveBeenCalledOnce();
    expect(html).toContain('@page { size: A4');
    expect(html).toContain('LEASE AGREEMENT');
    expect(html).toContain('T-20');
    expect(html).toContain('PAYMENT TERMS');
    expect(html).toContain('20M - Ali Juma Villa');
    expect(html).toContain('Electricity');
    expect(html).toContain('If the lease contract includes electricity and water');
    expect(html).toContain('Leaser’s Signature &amp; Stamp');
    expect(print).toHaveBeenCalledOnce();

    open.mockRestore();
  });

  it('does nothing when the browser blocks the print window', () => {
    const component = fixture.componentInstance as any;
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    expect(() => component.openPrintWindow()).not.toThrow();
    expect(open).toHaveBeenCalledOnce();

    open.mockRestore();
  });
});
