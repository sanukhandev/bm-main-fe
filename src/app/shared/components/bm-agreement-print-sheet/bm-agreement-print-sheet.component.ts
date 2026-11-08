import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Branch } from '../../../core/branch-context/branch.models';
import { Customer } from '../../models/customer.models';
import { OwnerAgreement, TenantAgreement } from '../../models/agreement.models';
import { Property, PropertyUtility } from '../../models/property.models';
import { formatUaeDate } from '../../utils/uae-formatters';

type PrintableAgreement = OwnerAgreement | TenantAgreement;

export interface PrintableParty {
  name?: string | null;
  role?: string | null;
  customer?: Customer | null;
}

export type PrintableProperty = Partial<Property> & {
  property?: Partial<Property> | null;
  property_id?: number | null;
};

interface PrintableClause {
  en: string;
  ar: string;
}

@Component({
  selector: 'bm-agreement-print-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="agreement-print-sheet" aria-label="Printable agreement">
      <header class="print-letterhead">
        <div>
          <strong>BAITHUL MADEENA REAL ESTATE</strong>
          <span>Official Agreement Document / وثيقة اتفاقية رسمية</span>
        </div>
        <div class="print-branch">
          <strong>{{ branchName }}</strong>
          <span>{{ branchAddress }}</span>
          <span *ngIf="branch?.phone">{{ branch?.phone }}</span>
        </div>
      </header>

      <header class="print-title">
        <h1>{{ isOwnerAgreement ? 'OWNER MANAGEMENT AGREEMENT' : 'LEASE AGREEMENT' }}</h1>
        <p>{{ isOwnerAgreement ? 'اتفاقية إدارة عقار' : 'عقد الإيجار' }}</p>
        <div class="print-meta">
          <span><b>Agreement No. / رقم الاتفاقية:</b> {{ agreement.agreement_no || '—' }}</span>
          <span><b>Created On / تاريخ الإنشاء:</b> {{ formatDate(agreement.created_at) }}</span>
          <span><b>Status / الحالة:</b> {{ formatStatus(agreement.status) }}</span>
        </div>
      </header>

      <section class="print-parties print-grid">
        <div class="print-party">
          <h2>{{ isOwnerAgreement ? 'OWNER DETAILS / بيانات المالك' : 'LESSOR DETAILS / تفاصيل المؤجر' }}</h2>
          <p class="print-party-name">{{ partyName(firstParty, firstPartyName) }}</p>
          <p>{{ partyRole(firstParty, firstPartyRole) }}</p>
          <ng-container *ngIf="partyCustomer(firstParty) as customer">
            <p *ngIf="customer.identity_no || customer.company_registration_no">
              License / ID No. / رقم الرخصة أو الهوية: {{ customer.identity_no || customer.company_registration_no }}
            </p>
            <p *ngIf="customer.phone">Contact / التواصل: {{ customer.phone }}</p>
            <p *ngIf="customer.email">Email / البريد الإلكتروني: {{ customer.email }}</p>
            <p *ngIf="customer.address_line_1 || customer.city">
              Address / العنوان: {{ customerAddress(customer) }}
            </p>
          </ng-container>
          <ng-container *ngIf="!isOwnerAgreement">
            <p>License / ID No. / رقم الرخصة أو الهوية: {{ business.eid }}</p>
            <p>Address / العنوان: {{ business.address }}</p>
            <p>Contact / التواصل: {{ business.phone }}</p>
          </ng-container>
        </div>

        <div class="print-party">
          <h2>{{ isOwnerAgreement ? 'TENANT DETAILS / بيانات المستأجر' : 'TENANT DETAILS / بيانات المستأجر' }}</h2>
          <p class="print-party-name">{{ partyName(secondParty, secondPartyName) }}</p>
          <p>{{ partyRole(secondParty, secondPartyRole) }}</p>
          <ng-container *ngIf="partyCustomer(secondParty) as customer">
            <p *ngIf="customer.identity_no || customer.company_registration_no">
              License / ID No. / رقم الرخصة أو الهوية: {{ customer.identity_no || customer.company_registration_no }}
            </p>
            <p *ngIf="customer.phone">Contact / التواصل: {{ customer.phone }}</p>
            <p *ngIf="customer.email">Email / البريد الإلكتروني: {{ customer.email }}</p>
            <p *ngIf="customer.address_line_1 || customer.city">
              Address / العنوان: {{ customerAddress(customer) }}
            </p>
          </ng-container>
          <ng-container *ngIf="isOwnerAgreement">
            <p>License / ID No. / رقم الرخصة أو الهوية: {{ business.eid }}</p>
            <p>Address / العنوان: {{ business.address }}</p>
            <p>Contact / التواصل: {{ business.phone }}</p>
          </ng-container>
        </div>
      </section>

      <section class="print-section">
        <h2>LEASE DETAILS / تفاصيل الإيجار</h2>
        <table class="print-table">
          <tbody>
            <tr>
              <th>Lease Period<br /><span>فترة الإيجار</span></th>
              <td>{{ formatDate(agreement.start_date) }} — {{ formatDate(agreement.end_date) }}</td>
              <th>Duration / المدة الزمنية</th>
              <td>{{ duration }}</td>
            </tr>
            <tr>
              <th>Total Rent / قيمة الإيجار</th>
              <td>{{ money(agreement.total_amount) }}</td>
              <th>Payment Mode / طريقة الدفع</th>
              <td>{{ formatPaymentMode(agreement.payment_mode) }}</td>
            </tr>
            <tr>
              <th>Payment Terms / شروط الدفع</th>
              <td>{{ paymentTerms }}</td>
              <th>Terms / الشروط</th>
              <td>{{ agreementTerms }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>LEASED PREMISE / العقار المؤجر</h2>
        <table class="print-table print-properties">
          <thead>
            <tr>
              <th>#</th>
              <th>Property / العقار</th>
              <th>Unit / الوحدة</th>
              <th>Category / الفئة</th>
              <th>Area / المنطقة</th>
              <th>File / الملف</th>
              <th>Usage / الاستخدام</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ getPropertyField(property, 'name') }}<br />{{ getPropertyField(property, 'property_code') }}</td>
              <td>{{ getPropertyField(property, 'unit_number') }}</td>
              <td>{{ getPropertyField(property, 'property_type') }}</td>
              <td>{{ getPropertyField(property, 'area') }}</td>
              <td>{{ agreement.file_no || '—' }}</td>
              <td>{{ getPropertyField(property, 'notes') }}</td>
            </tr>
            <tr *ngIf="properties.length === 0">
              <td colspan="7">No property details recorded / لا توجد تفاصيل عقار مسجلة</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section" *ngIf="propertyServiceRows.length">
        <h2>AMENITIES AND SERVICES / المرافق والخدمات</h2>
        <table class="print-table">
          <thead>
            <tr><th>Property / العقار</th><th>Provided service or amenity / الخدمة أو المرفق</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of propertyServiceRows">
              <td>{{ row.property }}</td>
              <td>{{ row.services }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section" *ngIf="agreement.installments?.length">
        <h2>PAYMENT SCHEDULE / جدول الدفعات</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date / تاريخ الاستحقاق</th>
              <th>Particulars / التفاصيل</th>
              <th>Amount / المبلغ</th>
              <th>Mode / الطريقة</th>
              <th>Status / الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of agreement.installments">
              <td>{{ item.installment_no }}</td>
              <td>{{ formatDate(item.due_date) }}</td>
              <td>{{ display(item.particulars) }}</td>
              <td>{{ money(item.amount) }}</td>
              <td>{{ formatPaymentMode(item.payment_mode) }}</td>
              <td>{{ formatStatus(item.status) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section" *ngIf="agreement.additional_payments?.length">
        <h2>OTHER PAYMENT TERMS / شروط دفع أخرى</h2>
        <table class="print-table">
          <thead>
            <tr><th>Particulars / التفاصيل</th><th>Due Date / الاستحقاق</th><th>Amount / المبلغ</th><th>Mode / الطريقة</th><th>Terms / الشروط</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of agreement.additional_payments">
              <td>{{ display(item.particulars) }}</td>
              <td>{{ formatDate(item.due_date) }}</td>
              <td>{{ money(item.amount) }}</td>
              <td>{{ formatPaymentMode(item.payment_mode) }}</td>
              <td>{{ display(item.terms) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section print-clauses">
        <h2>TERMS AND CONDITIONS / الشروط والأحكام</h2>
        <div class="print-clause print-grid" *ngFor="let clause of clauses; let i = index">
          <div><b>{{ i + 1 }}. {{ clause.en }}</b></div>
          <div dir="rtl"><b>{{ i + 1 }}. {{ clause.ar }}</b></div>
        </div>
      </section>

      <section class="print-signatures print-grid">
        <div>
          <h2>FIRST PARTY SIGNATURE / توقيع الطرف الأول</h2>
          <div class="signature-line"></div>
          <p>Name / الاسم: {{ partyName(firstParty, firstPartyName) }}</p>
          <p>Date / التاريخ: _________________________</p>
        </div>
        <div>
          <h2>SECOND PARTY SIGNATURE / توقيع الطرف الثاني</h2>
          <div class="signature-line"></div>
          <p>Name / الاسم: {{ partyName(secondParty, secondPartyName) }}</p>
          <p>Date / التاريخ: _________________________</p>
        </div>
      </section>

      <footer class="print-footer">
        <p>Baithul Madeena Real Estate · {{ branchName }} · Official Agreement Copy</p>
        <p>هذه الوثيقة نسخة رسمية من الاتفاقية</p>
      </footer>
    </article>
  `,
  styles: [
    `
      .agreement-print-sheet {
        display: none;
        color: #000;
        background: #fff;
        font-family: Arial, Tahoma, sans-serif;
        font-size: 9pt;
        line-height: 1.35;
      }
      .print-letterhead {
        display: flex;
        justify-content: space-between;
        gap: 8mm;
        border-bottom: 1px solid #000;
        padding-bottom: 3mm;
        margin-bottom: 5mm;
        font-size: 8pt;
      }
      .print-letterhead > div { display: flex; flex-direction: column; gap: 1mm; }
      .print-letterhead strong { font-size: 11pt; }
      .print-branch { text-align: right; }
      .print-title { text-align: center; border-bottom: 1px solid #000; padding-bottom: 4mm; margin-bottom: 5mm; }
      .print-title h1 { font-size: 15pt; margin: 0; letter-spacing: 0.03em; }
      .print-title p { margin: 1mm 0 3mm; font-size: 11pt; }
      .print-meta { display: flex; justify-content: space-between; gap: 5mm; text-align: left; font-size: 8pt; }
      .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
      .print-party { border: 1px solid #000; padding: 3mm; min-height: 29mm; }
      .print-party h2, .print-section h2, .print-signatures h2 { font-size: 9pt; margin: 0 0 2mm; font-weight: 700; }
      .print-party p { margin: 1mm 0; }
      .print-party-name { font-size: 10pt; font-weight: 700; }
      .print-section { margin-top: 5mm; break-inside: avoid; }
      .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .print-table th, .print-table td { border: 1px solid #000; padding: 2mm; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
      .print-table th { font-weight: 700; }
      .print-table th span { font-weight: 400; }
      .print-properties th:nth-child(1), .print-properties td:nth-child(1) { width: 4%; text-align: center; }
      .print-properties th:nth-child(2), .print-properties td:nth-child(2) { width: 22%; }
      .print-properties th:nth-child(3), .print-properties td:nth-child(3) { width: 15%; }
      .print-clauses { break-inside: auto; }
      .print-clause { border: 1px solid #000; border-bottom: 0; padding: 2.5mm; gap: 0; break-inside: avoid; }
      .print-clause:last-child { border-bottom: 1px solid #000; }
      .print-clause > div { padding: 0 2.5mm; }
      .print-clause > div + div { border-left: 1px solid #000; }
      .print-signatures { margin-top: 14mm; break-inside: avoid; }
      .print-signatures > div { min-height: 29mm; }
      .signature-line { border-bottom: 1px solid #000; height: 13mm; margin-bottom: 2mm; }
      .print-signatures p { margin: 1mm 0; }
      .print-footer { border-top: 1px solid #000; margin-top: 9mm; padding-top: 2mm; text-align: center; font-size: 7pt; }
      @media print {
        .agreement-print-sheet { display: block !important; }
        @page { size: A4; margin: 10mm 12mm; }
      }
    `,
  ],
})
export class BmAgreementPrintSheetComponent {
  @Input({ required: true }) agreement!: PrintableAgreement;
  @Input({ required: true }) firstPartyName = '';
  @Input({ required: true }) secondPartyName = '';
  @Input({ required: true }) firstPartyRole = '';
  @Input({ required: true }) secondPartyRole = '';
  @Input() firstParty: PrintableParty | null = null;
  @Input() secondParty: PrintableParty | null = null;
  @Input() branch: Branch | null = null;
  @Input() isOwnerAgreement = false;
  @Input() properties: PrintableProperty[] = [];

  readonly business = {
    name: 'BAITHUL MADEENA REAL ESTATE',
    eid: '784-0000-0000000-0',
    address: 'Office 000, Business Bay, Dubai, United Arab Emirates',
    phone: '+971 4 000 0000',
  };

  private readonly tenantClauses: PrintableClause[] = [
    {
      en: 'In the case of vacating the property, the tenant must deliver the property as it was received, settle all financial amount, maintenance work, handover the clearance and the keys, and in the event of non-compliance and delay in delivery, the rent is calculated until the date of delivery.',
      ar: 'في حالة إخلاء العقار يجب على المستأجر تسليم العقار كما استلمه وتسوية جميع الأمور المالية وأعمال الصيانة وتسليم براءة الذمة والمفاتيح، وفي حالة عدم الالتزام والتأخير في التسليم يتم احتساب الإيجار حتى تاريخ التسليم.',
    },
    {
      en: 'In case of cancellation of the contract before the expiration period of the agreement, both parties should be agreed.',
      ar: 'في حالة إلغاء العقد قبل انتهاء مدة الاتفاقية يجب أن يتفق الطرفان.',
    },
    {
      en: 'If tenant delayed the payment / cheque bounced to the lessor then tenant must pay 2% fine for every 15 days.',
      ar: 'في حالة تأخر المستأجر في دفع الإيجار أو ارتجاع الشيك يجب على المستأجر دفع غرامة 2٪ كل 15 يوماً.',
    },
    {
      en: 'If the lease contract includes electricity and water, there is no need to obtain a clearance from the tenant.',
      ar: 'إذا كان عقد الإيجار يشمل الكهرباء والمياه فلا داعي لاستخراج براءة ذمة من المستأجر.',
    },
  ];

  private readonly ownerClauses: PrintableClause[] = [
    {
      en: 'The tenant has the right to lease the property without referring to the lessor.',
      ar: 'يحق للمستأجر تأجير العقار دون الرجوع إلى المؤجر.',
    },
    {
      en: 'If required, the tenant has the right to do any maintenance works or alteration.',
      ar: 'عند الحاجة يحق للمستأجر القيام بأعمال الصيانة أو التعديلات.',
    },
    {
      en: 'If tenant needed any clearance, or any documents of the property (Site Plan, Title Deed, Power of Attorney), it must be provided by the lessor.',
      ar: 'في حال طلب المستأجر أي براءة ذمة أو مستندات للعقار مثل مخطط الموقع أو سند الملكية أو التوكيل يجب أن يوفرها المؤجر.',
    },
    {
      en: 'In the event of cancellation of the lease contract from the tenant, he must warn the lessor 3 months in advance and refund the security deposit to the tenant.',
      ar: 'في حالة إلغاء عقد الإيجار من المستأجر يجب عليه إنذار المؤجر قبل ثلاثة أشهر وإرجاع مبلغ التأمين للمستأجر.',
    },
    {
      en: 'The lessor does not have the right to cancel the lease without the consent of the tenant.',
      ar: 'لا يحق للمؤجر إلغاء عقد الإيجار دون موافقة المستأجر.',
    },
  ];

  formatDate = formatUaeDate;

  get clauses(): PrintableClause[] {
    return this.isOwnerAgreement ? this.ownerClauses : this.tenantClauses;
  }

  get branchAddress(): string {
    if (!this.branch) return '—';
    return [this.branch.address_line_1, this.branch.address_line_2, this.branch.city, this.branch.state_or_emirate]
      .filter(Boolean)
      .join(', ') || '—';
  }

  get branchName(): string {
    return this.branch?.name || (this.agreement?.branch_id ? `Branch #${this.agreement.branch_id}` : '—');
  }

  get duration(): string {
    if (!this.agreement?.start_date || !this.agreement?.end_date) return '—';
    const start = new Date(`${this.agreement.start_date}T00:00:00Z`);
    const end = new Date(`${this.agreement.end_date}T00:00:00Z`);
    const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
    return `${(days / 365).toFixed(2)} year(s)`;
  }

  get paymentTerms(): string {
    const count = this.display(this.agreement?.payment_count);
    const frequency = this.display(this.agreement?.payment_frequency);
    const mode = this.formatPaymentMode(this.agreement?.payment_mode);
    return `${count} ${frequency} · ${mode}`;
  }

  get agreementTerms(): string {
    const terms = [this.agreement?.terms_text, this.agreement?.notes].filter(Boolean).join(' · ');
    return this.display(terms);
  }

  get propertyServiceRows(): Array<{ property: string; services: string }> {
    return this.properties
      .map((property) => ({
        property: this.getPropertyField(property, 'name') || this.getPropertyField(property, 'property_code'),
        services: this.propertyUtilities(property).join('; '),
      }))
      .filter((row) => row.services.length > 0);
  }

  partyName(party: PrintableParty | null, fallback: string): string {
    return this.display(party?.name || fallback);
  }

  partyRole(party: PrintableParty | null, fallback: string): string {
    return this.display(party?.role || fallback);
  }

  partyCustomer(party: PrintableParty | null): Customer | null {
    return party?.customer || null;
  }

  customerAddress(customer: Customer): string {
    return [customer.address_line_1, customer.address_line_2, customer.city, customer.state_or_emirate]
      .filter(Boolean)
      .join(', ') || '—';
  }

  propertyValue(property: PrintableProperty): Partial<Property> {
    return property.property || property;
  }

  getPropertyField(property: PrintableProperty, field: keyof Property): string {
    const value = this.propertyValue(property)[field];
    return this.display(value);
  }

  propertyUtilities(property: PrintableProperty): string[] {
    const value = this.propertyValue(property);
    const services = new Set<string>();
    const add = (label: string, details: Array<unknown>) => {
      const text = details.filter(Boolean).map((item) => String(item)).join(' / ');
      if (text) services.add(`${label}: ${text}`);
    };

    const utilityTypes = new Set<PropertyUtility['type']>();
    for (const utility of value.utility_details || []) {
      utilityTypes.add(utility.type);
      add(this.utilityLabel(utility.type), [utility.provider, utility.connection_type, utility.account_number || utility.connection_number, utility.details]);
    }
    if (!utilityTypes.has('electricity')) add('Electricity', [value.electricity_provider, value.electricity_account_number]);
    if (!utilityTypes.has('cooling')) add('Cooling', [value.cooling_provider, value.cooling_account_number]);
    if (!utilityTypes.has('gas')) add('Gas', [value.gas_provider, value.gas_connection_type, value.gas_connection_number]);
    add('Amenities / Notes', [value.notes]);
    return [...services];
  }

  utilityLabel(type: PropertyUtility['type']): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  display(value: unknown): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  money(value: unknown): string {
    return `${this.agreement?.currency_code || this.branch?.currency_code || 'AED'} ${this.display(value)}`;
  }

  formatPaymentMode(mode?: string | null): string {
    return this.formatStatus(mode || '—');
  }

  formatStatus(status?: string | null): string {
    return this.display(status).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
