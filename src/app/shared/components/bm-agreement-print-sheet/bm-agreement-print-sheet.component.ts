import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, inject } from '@angular/core';
import { Branch } from '../../../core/branch-context/branch.models';
import { Customer } from '../../models/customer.models';
import { OwnerAgreement, TenantAgreement } from '../../models/agreement.models';
import { Property, PropertyUtility } from '../../models/property.models';
import { formatUaeDate, numberToWords } from '../../utils/uae-formatters';

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

const AGREEMENT_PRINT_STYLES = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { font-family: Arial, Tahoma, sans-serif; font-size: 9pt; line-height: 1.28; }
  .agreement-print-sheet { display: none; background: #fff; color: #000; }
  body.print-window .agreement-print-sheet { display: block; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm 12mm; }
  .print-letterhead-space { height: 21mm; }
  .print-header { display: flex; justify-content: space-between; gap: 8mm; align-items: flex-start; margin-bottom: 3mm; font-size: 7.5pt; }
  .print-header > div { display: flex; flex-direction: column; gap: 1mm; }
  .print-header strong { font-size: 10pt; }
  .print-header .print-branch { text-align: right; }
  .print-title { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3mm 0; text-align: center; }
  .print-title h1 { margin: 0; font-size: 14pt; }
  .print-title p { margin: 1mm 0 2mm; font-size: 10pt; }
  .print-meta { display: flex; justify-content: space-between; gap: 4mm; text-align: left; font-size: 7.5pt; }
  .print-section { margin-top: 4mm; break-inside: avoid; }
  .print-section h2 { margin: 0 0 1.5mm; font-size: 9pt; }
  .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .print-table th, .print-table td { border: 1px solid #000; padding: 1.7mm 1.8mm; vertical-align: top; overflow-wrap: anywhere; }
  .print-table th { font-weight: 700; }
  .print-table th span { font-weight: 400; }
  .party-table th, .party-table td { width: 20%; }
  .party-table th:first-child, .party-table td:first-child { width: 25%; }
  .party-table th:nth-child(3), .party-table td:nth-child(3) { width: 25%; }
  .party-table th:nth-child(4), .party-table td:nth-child(4) { width: 15%; }
  .party-table th:nth-child(5), .party-table td:nth-child(5) { width: 15%; }
  .property-table th:nth-child(1), .property-table td:nth-child(1) { width: 20%; }
  .property-table th:nth-child(2), .property-table td:nth-child(2) { width: 15%; }
  .property-table th:nth-child(3), .property-table td:nth-child(3) { width: 24%; }
  .property-table th:nth-child(4), .property-table td:nth-child(4) { width: 16%; }
  .property-table th:nth-child(5), .property-table td:nth-child(5) { width: 13%; }
  .property-table th:nth-child(6), .property-table td:nth-child(6) { width: 12%; }
  .property-table .empty-row td { text-align: center; }
  .terms-table { font-size: 7.5pt; }
  .terms-table td:first-child { width: 4%; text-align: center; }
  .terms-table td:nth-child(2), .terms-table td:nth-child(3) { width: 48%; }
  .terms-table td:nth-child(3) { direction: rtl; text-align: right; }
  .print-signatures { margin-top: 14mm; break-inside: avoid; }
  .print-signatures td { width: 33.33%; text-align: center; height: 25mm; vertical-align: bottom; }
  .signature-line { display: block; border-bottom: 1px solid #000; margin: 0 6mm 2mm; height: 13mm; }
  .print-footer { margin-top: 5mm; border-top: 1px solid #000; padding-top: 2mm; text-align: center; font-size: 7pt; }
  @page { size: A4; margin: 0; }
  @media print {
    html, body { width: 210mm; min-height: 297mm; }
    body.print-window .agreement-print-sheet { margin: 0; }
    .print-section { break-inside: avoid; }
    .terms-table tr, .print-signatures { break-inside: avoid; }
  }
`;

@Component({
  selector: 'bm-agreement-print-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="agreement-print-sheet" aria-label="Printable agreement">
      <div class="print-letterhead-space"></div>

      <header class="print-header">
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
        <h1>
          {{
            isOwnerAgreement ? 'OWNER AGREEMENT / اتفاقية المالك' : 'LEASE AGREEMENT / عقد الإيجار'
          }}
          #{{ display(agreement.agreement_no) }}
        </h1>
        <p>
          {{
            isOwnerAgreement
              ? 'Owner Management Agreement / اتفاقية إدارة عقار'
              : 'Lease Agreement / عقد الإيجار'
          }}
        </p>
        <div class="print-meta">
          <span><b>Created On / تاريخ الإنشاء:</b> {{ formatDate(agreement.created_at) }}</span>
          <span><b>Branch / الفرع:</b> {{ branchName }}</span>
          <span><b>Status / الحالة:</b> {{ formatStatus(agreement.status) }}</span>
        </div>
      </header>

      <section class="print-section">
        <h2>OWNER DETAILS / بيانات المالك</h2>
        <table class="print-table party-table">
          <thead>
            <tr>
              <th>Owner Name / اسم المالك</th>
              <th>Leaser Name / اسم المؤجر</th>
              <th>Address / العنوان</th>
              <th>License / ID No / رقم الرخصة/الهوية</th>
              <th>Contact / التواصل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{{ partyName(firstParty, firstPartyName) }}</strong>
              </td>
              <td>
                <strong>{{ partyName(firstParty, firstPartyName) }}</strong>
              </td>
              <td>{{ partyAddress(firstParty, !isOwnerAgreement) }}</td>
              <td>{{ partyIdentity(firstParty, !isOwnerAgreement) }}</td>
              <td>{{ partyContact(firstParty, !isOwnerAgreement) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>TENANT DETAILS / بيانات المستأجر</h2>
        <table class="print-table party-table">
          <thead>
            <tr>
              <th>Tenant Name / اسم المستأجر</th>
              <th>License / ID No / رقم الرخصة/الهوية</th>
              <th>Contact / التواصل</th>
              <th>Role / الصفة</th>
              <th>Branch / الفرع</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{{ partyName(secondParty, secondPartyName) }}</strong>
              </td>
              <td>{{ partyIdentity(secondParty, isOwnerAgreement) }}</td>
              <td>{{ partyContact(secondParty, isOwnerAgreement) }}</td>
              <td>{{ partyRole(secondParty, secondPartyRole) }}</td>
              <td>{{ branchName }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>LEASED PREMISE / المبنى أو المكان المؤجر</h2>
        <table class="print-table property-table">
          <thead>
            <tr>
              <th>Category / الفئة</th>
              <th>No. of rooms / عدد الغرف</th>
              <th>Unit No / رقم الوحدة</th>
              <th>Area / المنطقة</th>
              <th>Plot No / القطعة رقم</th>
              <th>File No / رقم الملف</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties">
              <td>
                <strong>{{ getPropertyField(property, 'property_type') }}</strong>
              </td>
              <td>{{ getPropertyField(property, 'unit_number') }}</td>
              <td>
                {{ getPropertyField(property, 'name') }} /
                {{ getPropertyField(property, 'property_code') }}
              </td>
              <td>{{ getPropertyField(property, 'area') }}</td>
              <td>{{ getPropertyField(property, 'property_code') }}</td>
              <td>{{ display(agreement.file_no) }}</td>
            </tr>
            <tr *ngIf="properties.length === 0" class="empty-row">
              <td colspan="6">No property details recorded / لا توجد تفاصيل عقار مسجلة</td>
            </tr>
          </tbody>
        </table>
        <table class="print-table property-table">
          <thead>
            <tr>
              <th>Landmark / معلم معروف</th>
              <th colspan="2">Usage / الاستخدام</th>
              <th colspan="3">Property Address / عنوان العقار</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties">
              <td>{{ getPropertyField(property, 'building_name') }}</td>
              <td colspan="2">{{ getPropertyField(property, 'notes') }}</td>
              <td colspan="3">{{ propertyAddress(property) }}</td>
            </tr>
            <tr *ngIf="properties.length === 0" class="empty-row">
              <td colspan="6">—</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section" *ngIf="propertyServiceRows.length">
        <h2>ELECTRICITY, WATER, SEWAGE AND SERVICES / الكهرباء والمياه والصرف الصحي والخدمات</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Property / العقار</th>
              <th>Payee / المستفيد</th>
              <th>Mode / النظام</th>
              <th>Provided service or amenity / الخدمة أو المرفق</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of propertyServiceRows">
              <td>{{ row.property }}</td>
              <td>{{ isOwnerAgreement ? 'Owner' : 'Tenant' }}</td>
              <td>As recorded / حسب السجل</td>
              <td>{{ row.services }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>LEASE PERIOD / فترة الإيجار</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Lease Start / بداية الإيجار</th>
              <th>Lease End / نهاية الإيجار</th>
              <th>Duration / المدة الزمنية</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{{ formatDate(agreement.start_date) }}</strong>
              </td>
              <td>
                <strong>{{ formatDate(agreement.end_date) }}</strong>
              </td>
              <td>
                <strong>{{ duration }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>PAYMENT TERMS / شروط الدفع</h2>
        <table class="print-table">
          <tbody>
            <tr>
              <td><b>Total Rent / قيمة الإيجار:</b> {{ money(agreement.total_amount) }}</td>
              <td>
                <b>Mode of payment / طريقة الدفع:</b>
                {{ formatPaymentMode(agreement.payment_mode) }}
              </td>
              <td>
                <b>No. of payments / عدد الدفعات:</b> {{ display(agreement.payment_count) }}
                {{ display(agreement.payment_frequency) }}
              </td>
            </tr>
            <tr>
              <td><b>Total Rent in Words / قيمة الإيجار كتابة:</b></td>
              <td colspan="2">
                <strong>{{ amountInWords(agreement.total_amount) }}</strong>
              </td>
            </tr>
            <tr>
              <td><b>Deposit / التأمين:</b> {{ depositAmount }}</td>
              <td colspan="2"><b>Mode of pay / طريقة الدفع:</b> {{ depositMode }}</td>
            </tr>
            <tr>
              <td colspan="3"><b>Remarks / ملاحظات:</b> {{ agreementTerms }}</td>
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
            <tr>
              <th>Particulars / التفاصيل</th>
              <th>Due Date / الاستحقاق</th>
              <th>Amount / المبلغ</th>
              <th>Mode / الطريقة</th>
              <th>Terms / الشروط</th>
            </tr>
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

      <section class="print-section">
        <h2>TERMS AND CONDITIONS / الشروط والأحكام</h2>
        <table class="print-table terms-table">
          <tbody>
            <tr *ngFor="let clause of clauses; let i = index">
              <td>{{ i + 1 }}.</td>
              <td>{{ clause.en }}</td>
              <td dir="rtl">{{ clause.ar }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <table class="print-table print-signatures">
        <tbody>
          <tr>
            <td>
              <span class="signature-line"></span><strong>Leaser’s Signature & Stamp</strong> /
              توقيع وختم المؤجر
            </td>
            <td><span class="signature-line"></span><strong>Witness</strong> / الشاهد</td>
            <td>
              <span class="signature-line"></span><strong>Tenant Signature & Stamp</strong> / توقيع
              وختم المستأجر
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="print-footer">
        <div>Baithul Madeena Real Estate · {{ branchName }} · Official Agreement Copy</div>
        <div>هذه الوثيقة نسخة رسمية من الاتفاقية</div>
      </footer>
    </article>
  `,
  styles: [AGREEMENT_PRINT_STYLES],
})
export class BmAgreementPrintSheetComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

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

  openPrintWindow(): void {
    if (typeof window === 'undefined') return;

    const source = this.host.nativeElement.querySelector(
      '.agreement-print-sheet',
    ) as HTMLElement | null;
    if (!source) return;

    const printWindow = window.open('', '_blank', 'popup');
    if (!printWindow) return;

    const print = () => {
      printWindow.focus();
      printWindow.print();
    };

    printWindow.addEventListener('load', print, { once: true });
    printWindow.document.open();
    printWindow.document.write(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Agreement ${this.display(this.agreement?.agreement_no)}</title><style>${AGREEMENT_PRINT_STYLES}</style></head><body class="print-window">${source.outerHTML}</body></html>`,
    );
    printWindow.document.close();
  }

  get clauses(): PrintableClause[] {
    return this.isOwnerAgreement ? this.ownerClauses : this.tenantClauses;
  }

  get branchAddress(): string {
    if (!this.branch) return '—';
    return (
      [
        this.branch.address_line_1,
        this.branch.address_line_2,
        this.branch.city,
        this.branch.state_or_emirate,
      ]
        .filter(Boolean)
        .join(', ') || '—'
    );
  }

  get branchName(): string {
    return (
      this.branch?.name || (this.agreement?.branch_id ? `Branch #${this.agreement.branch_id}` : '—')
    );
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

  get depositAmount(): string {
    const payment = this.agreement?.additional_payments?.find(
      (item) => item.category === 'security',
    );
    return payment ? this.money(payment.amount) : 'NIL';
  }

  get depositMode(): string {
    const payment = this.agreement?.additional_payments?.find(
      (item) => item.category === 'security',
    );
    return payment ? this.formatPaymentMode(payment.payment_mode) : '—';
  }

  get propertyServiceRows(): Array<{ property: string; services: string }> {
    return this.properties
      .map((property) => ({
        property:
          this.getPropertyField(property, 'name') ||
          this.getPropertyField(property, 'property_code'),
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

  partyIdentity(party: PrintableParty | null, useBusiness: boolean): string {
    const customer = this.partyCustomer(party);
    return this.display(
      customer?.identity_no ||
        customer?.company_registration_no ||
        (useBusiness ? this.business.eid : ''),
    );
  }

  partyContact(party: PrintableParty | null, useBusiness: boolean): string {
    return this.display(
      this.partyCustomer(party)?.phone || (useBusiness ? this.business.phone : ''),
    );
  }

  partyAddress(party: PrintableParty | null, useBusiness: boolean): string {
    const customer = this.partyCustomer(party);
    return customer
      ? this.customerAddress(customer)
      : this.display(useBusiness ? this.business.address : '');
  }

  customerAddress(customer: Customer): string {
    return (
      [customer.address_line_1, customer.address_line_2, customer.city, customer.state_or_emirate]
        .filter(Boolean)
        .join(', ') || '—'
    );
  }

  propertyAddress(property: PrintableProperty): string {
    const value = this.propertyValue(property);
    return (
      [value.address_line_1, value.address_line_2, value.city, value.state_or_emirate]
        .filter(Boolean)
        .join(', ') || '—'
    );
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
      const text = details
        .filter(Boolean)
        .map((item) => String(item))
        .join(' / ');
      if (text) services.add(`${label}: ${text}`);
    };

    const utilityTypes = new Set<PropertyUtility['type']>();
    for (const utility of value.utility_details || []) {
      utilityTypes.add(utility.type);
      add(this.utilityLabel(utility.type), [
        utility.provider,
        utility.connection_type,
        utility.account_number || utility.connection_number,
        utility.details,
      ]);
    }
    if (!utilityTypes.has('electricity'))
      add('Electricity', [value.electricity_provider, value.electricity_account_number]);
    if (!utilityTypes.has('cooling'))
      add('Cooling', [value.cooling_provider, value.cooling_account_number]);
    if (!utilityTypes.has('gas'))
      add('Gas', [value.gas_provider, value.gas_connection_type, value.gas_connection_number]);
    add('Amenities / Notes', [value.notes]);
    return [...services];
  }

  utilityLabel(type: PropertyUtility['type']): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  amountInWords(value: unknown): string {
    return numberToWords(value as string | number | null | undefined);
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
    return this.display(status)
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
