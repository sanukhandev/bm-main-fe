import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, inject } from '@angular/core';
import { Branch } from '../../../core/branch-context/branch.models';
import { Customer } from '../../models/customer.models';
import { OwnerAgreement, TenantAgreement } from '../../models/agreement.models';
import { Property, PropertyUtility } from '../../models/property.models';
import { formatUaeDate, numberToWords } from '../../utils/uae-formatters';

type PrintableAgreement = OwnerAgreement | TenantAgreement;

const AGREEMENT_PRINT_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';

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

export interface PrintableAmenityRow {
  name: string;
  nameAr: string;
  identifier: string;
  provider: string;
  mode: string;
  payableBy: string;
  payableByAr: string;
}

const AGREEMENT_PRINT_STYLES = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { font-family: 'Noto Sans Arabic', Arial, Tahoma, sans-serif; font-size: 8.2pt; line-height: 1.3; }
  .agreement-print-sheet { display: none; background: #fff; color: #000; }
  body.print-window .agreement-print-sheet {
    display: block;
    width: 200mm;
    max-height: 297mm;
    margin: 0 auto;
    padding: 35mm 6mm 2mm 6mm;
  }
  .print-header {
    position: relative;
    border-bottom: 1.5px solid #000;
    padding-bottom: 1.5mm;
    margin-bottom: 2mm;
    min-height: 10mm;
  }
  .print-title-area { text-align: center; }
  .print-title-area h1 { margin: 0; font-size: 13pt; font-weight: 800; letter-spacing: 0.2px; line-height: 1.2; }
  .print-meta-below {
    margin-top: 0.4mm;
    font-size: 7.8pt;
  }
  .print-agreement-no {
    position: absolute;
    right: 0;
    bottom: 1.5mm;
    display: flex;
    align-items: baseline;
    gap: 1mm;
  }
  .print-agreement-val {
    font-size: 8pt;
    font-weight: 800;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .print-section { margin-top: 2.2mm; break-inside: avoid; page-break-inside: avoid; }
  .print-section h2 { margin: 0 0 1mm; font-size: 8pt; font-weight: 700; text-transform: uppercase; }
  .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .print-table th, .print-table td { border: 1px solid #000; padding: 1.25mm 1.5mm; vertical-align: middle; overflow-wrap: anywhere; font-size: 7.6pt; line-height: 1.25; }
  .capitalize-text { text-transform: capitalize; }
  .party-table th, .party-table td { width: 25%; }
  .owner-party-table th, .owner-party-table td { width: 20%; }
  .property-table th:nth-child(1), .property-table td:nth-child(1) { width: 23%; }
  .property-table th:nth-child(2), .property-table td:nth-child(2) { width: 9%; }
  .property-table th:nth-child(3), .property-table td:nth-child(3) { width: 12%; }
  .property-table th:nth-child(4), .property-table td:nth-child(4) { width: 9%; }
  .property-table th:nth-child(5), .property-table td:nth-child(5) { width: 10%; }
  .property-table th:nth-child(6), .property-table td:nth-child(6) { width: 11%; }
  .property-table th:nth-child(7), .property-table td:nth-child(7) { width: 10%; }
  .property-table th:nth-child(8), .property-table td:nth-child(8) { width: 16%; }
  .property-table .empty-row td { text-align: center; }
  .services-table th:nth-child(1), .services-table td:nth-child(1) { width: 28%; }
  .services-table th:nth-child(2), .services-table td:nth-child(2) { width: 25%; }
  .services-table th:nth-child(3), .services-table td:nth-child(3) { width: 24%; }
  .services-table th:nth-child(4), .services-table td:nth-child(4) { width: 23%; }
  .payment-table th:nth-child(1), .payment-table td:nth-child(1) { width: 14%; }
  .payment-table th:nth-child(2), .payment-table td:nth-child(2) { width: 22%; }
  .payment-table th:nth-child(3), .payment-table td:nth-child(3) { width: 18%; }
  .payment-table th:nth-child(4), .payment-table td:nth-child(4) { width: 16%; }
  .payment-table th:nth-child(5), .payment-table td:nth-child(5) { width: 30%; }
  .payment-table th, .payment-table td { font-size: 7.3pt; }
  .terms-table { font-size: 7.1pt; line-height: 1.25; }
  .terms-table td:first-child { width: 3.5%; text-align: center; font-weight: 700; vertical-align: top; }
  .terms-table td:nth-child(2) { width: 48.25%; padding: 1mm 1.3mm; vertical-align: top; text-align: left; line-height: 1.25; }
  .terms-table td:nth-child(3) { width: 48.25%; padding: 1mm 1.3mm; vertical-align: top; direction: rtl; text-align: right; line-height: 1.4; }
  .print-signatures { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 2.8mm; break-inside: avoid; page-break-inside: avoid; }
  .print-signatures td { width: 33.33%; border: 0; padding: 0 1mm; text-align: center; height: 14mm; vertical-align: bottom; font-size: 7.4pt; line-height: 1.3; }
  .signature-line { display: block; border-bottom: 1.2px solid #000; margin: 0 3mm 1mm; height: 7mm; }
  @page { size: A4 portrait; margin: 0; }
  @media print {
    html, body { width: 210mm; height: 297mm; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
    body.print-window .agreement-print-sheet { width: 210mm !important; max-height: 297mm !important; margin: 0 !important; padding: 35mm 8mm 2mm 8mm !important; overflow: hidden !important; box-sizing: border-box !important; }
    .print-section, .print-table tr, .print-signatures { break-inside: avoid !important; page-break-inside: avoid !important; }
  }
`;

@Component({
  selector: 'bm-agreement-print-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="agreement-print-sheet" aria-label="Printable agreement">
      <header class="print-header">
        <div class="print-title-area">
          <h1>
            {{ isOwnerAgreement ? 'LEASE AGREEMENT / اتفاقية إيجار' : 'TENANCY AGREEMENT' }}
          </h1>
          <div class="print-meta-below">
            <b>Created On / تاريخ الإنشاء:</b> {{ formatDate(agreement.created_at) }}
          </div>
        </div>
        <div>
          <div class="print-agreement-no">
            <span class="print-agreement-label">Agreement No:</span>
            <span class="print-agreement-val">{{ display(agreement.agreement_no) }}</span>
          </div>
        </div>
      </header>

      <ng-container *ngIf="isOwnerAgreement; else lessorDetails">
        <section class="print-section">
          <h2>OWNER DETAILS / بيانات المالك</h2>
          <table class="print-table party-table owner-party-table">
            <thead>
              <tr>
                <th>Owner Name / اسم المالك</th>
                <th>Leaser Name / اسم المؤجر</th>
                <th>Address / العنوان</th>
                <th>License / ID No / رقم<br />الرخصة/الهوية</th>
                <th>Contact / التواصل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{{ partyName(firstParty, firstPartyName) }}</strong>
                </td>
                <td>
                  <strong>{{ business.name }}</strong>
                </td>
                <td>{{ partyAddress(firstParty, !isOwnerAgreement) }}</td>
                <td>{{ partyIdentity(firstParty, !isOwnerAgreement) }}</td>
                <td>{{ partyContact(firstParty, !isOwnerAgreement) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </ng-container>
      <ng-template #lessorDetails>
        <section class="print-section">
          <h2>LESSOR DETAILS / بيانات المؤجر</h2>
          <table class="print-table party-table lessor-table">
            <thead>
              <tr>
                <th>Leaser Name / اسم المؤجر</th>
                <th>Address / العنوان</th>
                <th>License / ID No / رقم الرخصة/الهوية</th>
                <th>Contact / التواصل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{{ business.name }}</strong>
                </td>
                <td>{{ partyAddress(firstParty, true) }}</td>
                <td>{{ partyIdentity(firstParty, true) }}</td>
                <td>{{ partyContact(firstParty, true) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </ng-template>

      <section class="print-section">
        <h2>TENANT DETAILS / بيانات المستأجر</h2>
        <table
          *ngIf="isOwnerAgreement; else tenancyTenantDetails"
          class="print-table party-table tenant-table"
        >
          <thead>
            <tr>
              <th>Tenant Name / اسم المستأجر</th>
              <th>Address / العنوان</th>
              <th>License / ID No / رقم الرخصة/الهوية</th>
              <th>Contact / التواصل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{{ business.name }}</strong>
              </td>
              <td>{{ partyAddress(secondParty, true) }}</td>
              <td>{{ partyIdentity(secondParty, true) }}</td>
              <td>{{ partyContact(secondParty, true) }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #tenancyTenantDetails>
          <table class="print-table party-table tenant-table">
            <thead>
              <tr>
                <th>Tenant Name / اسم المستأجر</th>
                <th>License / ID No</th>
                <th>Cont No</th>
                <th>Email Id</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{{ partyName(secondParty, secondPartyName) }}</strong>
                </td>
                <td>{{ partyIdentity(secondParty, false) }}</td>
                <td>{{ partyContact(secondParty, false) }}</td>
                <td>{{ partyEmail(secondParty) }}</td>
                <td>{{ partyAddress(secondParty, false) }}</td>
              </tr>
            </tbody>
          </table>
        </ng-template>
      </section>

      <section class="print-section">
        <h2>LEASED PROPERTY / العقار المؤجر</h2>
        <table class="print-table property-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Unit</th>
              <th>UNIT NO:</th>
              <th>PLOT NO:</th>
              <th>{{ isOwnerAgreement ? 'File no' : 'FILE NO' }}</th>
              <th>Usage</th>
              <th>LAND MARK</th>
              <th>ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties">
              <td class="capitalize-text">
                {{ formatPropertyType(getPropertyField(property, 'property_type')) }}
              </td>
              <td>{{ propertyUnitsInside(property) }}</td>
              <td>{{ getPropertyField(property, 'unit_number') }}</td>
              <td>{{ getPropertyField(property, 'plot_number') }}</td>
              <td>{{ display(agreement.file_no) }}</td>
              <td>{{ formatPropertyUsage(getPropertyField(property, 'usage')) }}</td>
              <td>{{ getPropertyField(property, 'landmark') }}</td>
              <td>{{ propertyAddress(property) }}</td>
            </tr>
            <tr *ngIf="properties.length === 0" class="empty-row">
              <td colspan="8">No property details recorded / لا توجد تفاصيل عقار مسجلة</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>ELECTRICITY, WATER, SEWAGE, AC AND FURNITURE</h2>
        <table
          class="print-table services-table"
          [ngClass]="isOwnerAgreement ? 'owner-services-table' : 'tenant-services-table'"
        >
          <thead>
            <tr>
              <th>Etihad W&amp;E Account No / Premise ID</th>
              <th>Payed By ({{ isOwnerAgreement ? 'Leaser / Tenant' : 'Tenant / Leaser' }})</th>
              <th>
                Furniture ({{ isOwnerAgreement ? 'Include / Exclude' : 'Including / Excluding' }})
              </th>
              <th>Aircondition (With / Without)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ utilityAccountNumbers }}</td>
              <td>{{ paidBy }}</td>
              <td>{{ furnitureValue }}</td>
              <td>{{ airConditionValue }}</td>
            </tr>
            <tr *ngIf="amenityNotes" class="amenity-notes-row">
              <td colspan="4"><strong>Remarks:</strong> {{ amenityNotes }}</td>
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
        <table class="print-table payment-table">
          <thead>
            <tr>
              <th>Total Rent</th>
              <th>In Words</th>
              <th>Mode of Pay<br />(Cash / Cheque)</th>
              <th>No of Pay<br />(1,2,4,6,8,10,12)</th>
              <th>Deposit (Cash, Dated Cheque, Undated Cheque)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ money(agreement.total_amount) }}</td>
              <td>{{ amountInWords(agreement.total_amount) }}</td>
              <td>{{ formatPaymentMode(agreement.payment_mode) }}</td>
              <td>{{ display(agreement.payment_count) }}</td>
              <td>{{ depositAmount }}</td>
            </tr>
            <tr>
              <td colspan="5"><b>REMARKS:</b> {{ agreementTerms }}</td>
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

      <table class="print-signatures">
        <tbody>
          <tr>
            <td>
              <span class="signature-line"></span><strong>Lessor Signature / Stamp</strong><br />
              توقيع وختم المؤجر
            </td>
            <td><span class="signature-line"></span><strong>Witness</strong><br />الشاهد</td>
            <td>
              <span class="signature-line"></span><strong>Tenant Signature / Stamp</strong><br />
              توقيع وختم المستأجر
            </td>
          </tr>
        </tbody>
      </table>
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
    licenseId: '1014157',
    address: 'Office 000, Business Bay, Dubai, United Arab Emirates',
    contact: '092236364, 055 4191214',
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

    const docTitle = this.isOwnerAgreement
      ? `Leasing Agreement ${this.display(this.agreement?.agreement_no)}`
      : `Tenant Contract ${this.display(this.agreement?.agreement_no)}`;

    printWindow.addEventListener('load', print, { once: true });
    printWindow.document.open();
    printWindow.document.write(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${docTitle}</title><link rel="stylesheet" href="${AGREEMENT_PRINT_FONT_URL}"><style>${AGREEMENT_PRINT_STYLES}</style></head><body class="print-window">${source.outerHTML}</body></html>`,
    );
    printWindow.document.close();
  }

  get clauses(): PrintableClause[] {
    return this.isOwnerAgreement ? this.ownerClauses : this.tenantClauses;
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
    end.setUTCDate(end.getUTCDate() + 1);

    const addMonths = (date: Date, months: number): Date => {
      const result = new Date(date);
      const day = result.getUTCDate();
      result.setUTCDate(1);
      result.setUTCMonth(result.getUTCMonth() + months);
      const lastDay = new Date(
        Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
      ).getUTCDate();
      result.setUTCDate(Math.min(day, lastDay));
      return result;
    };

    let years = end.getUTCFullYear() - start.getUTCFullYear();
    let cursor = addMonths(start, years * 12);
    if (cursor > end) {
      years -= 1;
      cursor = addMonths(start, years * 12);
    }

    let months =
      (end.getUTCFullYear() - cursor.getUTCFullYear()) * 12 +
      end.getUTCMonth() -
      cursor.getUTCMonth();
    cursor = addMonths(cursor, months);
    if (cursor > end) {
      months -= 1;
      cursor = addMonths(cursor, months);
    }

    const days = Math.max(0, Math.round((end.getTime() - cursor.getTime()) / 86_400_000));
    const parts = (
      [
        [years, 'year'],
        [months, 'month'],
        [days, 'day'],
      ] as Array<[number, string]>
    )
      .filter(([value]) => value > 0)
      .map(([value, unit]) => `${value} ${unit}${value === 1 ? '' : 's'}`);

    return parts.join(' ') || '0 days';
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

  get paidBy(): string {
    if (this.isOwnerAgreement) return '—';
    return ['electricity', 'water', 'gas', 'cooling'].some((type) =>
      this.isUtilityIncluded(type as 'electricity' | 'water' | 'gas' | 'cooling'),
    )
      ? 'Leaser / المؤجر'
      : 'Tenant / المستأجر';
  }

  get furnitureValue(): string {
    const values = this.getCommaSeparatedValues(
      (property) =>
        (this.propertyValue(property).utility_details || [])
          .filter((utility) => utility.type === 'furniture')
          .map((utility) => utility.details)
          .filter(Boolean) as string[],
    );
    return values;
  }

  get airConditionValue(): string {
    const values = this.getCommaSeparatedValues((property) => {
      const value = this.propertyValue(property);
      const utilityValues = (value.utility_details || [])
        .filter((utility) => utility.type === 'cooling')
        .flatMap((utility) => [utility.details, utility.provider, utility.connection_type])
        .filter(Boolean) as string[];
      return [value.cooling_provider, ...utilityValues].filter(Boolean) as string[];
    });
    return values;
  }

  get utilityAccountNumbers(): string {
    const values = this.amenityRows
      .filter((row) => row.name !== 'Furniture')
      .map((row) =>
        row.identifier === '—'
          ? `${row.name}: ${row.provider}`
          : `${row.name}: ${row.identifier} (${row.provider})`,
      );
    return values.length > 0 ? values.join(' / ') : '—';
  }

  get depositAmount(): string {
    const payment = this.agreement?.additional_payments?.find(
      (item) => item.category === 'security',
    );
    return payment ? this.money(payment.amount) : 'NIL';
  }

  get hasRecordedUtilities(): boolean {
    if (!this.properties?.length) return false;
    return this.amenityRows.length > 0 || Boolean(this.amenityNotes);
  }

  get amenityNotes(): string {
    const propertyNotes = this.properties.map((p) => this.propertyValue(p).notes).filter(Boolean);
    const agreementNotes = [this.agreement?.notes].filter(Boolean);
    const all = Array.from(new Set([...propertyNotes, ...agreementNotes]));
    return all.join(' · ');
  }

  get amenityRows(): PrintableAmenityRow[] {
    if (!this.properties?.length) return [];

    const rows: PrintableAmenityRow[] = [];

    // 1. Electricity
    const electricityIds = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const acc = val.electricity_account_number;
      const utilAcc = (val.utility_details || [])
        .filter((u) => u.type === 'electricity')
        .map((u) => u.account_number || u.connection_number)
        .filter(Boolean);
      return [acc, ...utilAcc].filter(Boolean) as string[];
    });
    const electricityProviders = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const prov = val.electricity_provider;
      const utilProv = (val.utility_details || [])
        .filter((u) => u.type === 'electricity')
        .map((u) => u.provider)
        .filter(Boolean);
      return [prov, ...utilProv].filter(Boolean) as string[];
    });
    if (electricityIds !== '—' || electricityProviders !== '—') {
      const electricityIncluded = this.isUtilityIncluded('electricity');
      const electricityPayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : electricityIncluded
          ? { en: 'Leaser', ar: 'المؤجر' }
          : { en: 'Tenant', ar: 'المستأجر' };

      rows.push({
        name: 'Electricity',
        nameAr: 'الكهرباء',
        identifier: electricityIds,
        provider: electricityProviders !== '—' ? electricityProviders : 'EtihadWE / DEWA / SEWA',
        mode: '',
        payableBy: electricityPayable.en,
        payableByAr: electricityPayable.ar,
      });
    }

    // 2. Water
    const waterIds = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      return (val.utility_details || [])
        .filter((u) => u.type === 'water')
        .map((u) => u.account_number || u.connection_number)
        .filter(Boolean) as string[];
    });
    const waterProviders = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      return (val.utility_details || [])
        .filter((u) => u.type === 'water')
        .map((u) => u.provider)
        .filter(Boolean) as string[];
    });
    if (waterIds !== '—' || waterProviders !== '—') {
      const waterIncluded = this.isUtilityIncluded('water');
      const waterPayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : waterIncluded
          ? { en: 'Leaser', ar: 'المؤجر' }
          : { en: 'Tenant', ar: 'المستأجر' };

      rows.push({
        name: 'Water',
        nameAr: 'المياه',
        identifier: waterIds,
        provider: waterProviders !== '—' ? waterProviders : 'Municipality / DEWA',
        mode: '',
        payableBy: waterPayable.en,
        payableByAr: waterPayable.ar,
      });
    }

    // 3. Sewage
    const sewageIds = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      return (val.utility_details || [])
        .filter((u) => u.type === 'sewage')
        .map((u) => u.account_number || u.connection_number)
        .filter(Boolean) as string[];
    });
    const sewageProviders = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      return (val.utility_details || [])
        .filter((u) => u.type === 'sewage')
        .map((u) => u.provider)
        .filter(Boolean) as string[];
    });
    if (sewageIds !== '—' || sewageProviders !== '—') {
      const sewagePayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : { en: 'Tenant', ar: 'المستأجر' };

      rows.push({
        name: 'Sewage',
        nameAr: 'الصرف الصحي',
        identifier: sewageIds,
        provider: sewageProviders !== '—' ? sewageProviders : 'Municipality',
        mode: '',
        payableBy: sewagePayable.en,
        payableByAr: sewagePayable.ar,
      });
    }

    // 4. Gas
    const gasIds = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const conn = val.gas_connection_number;
      const utilConn = (val.utility_details || [])
        .filter((u) => u.type === 'gas')
        .map((u) => u.connection_number || u.account_number)
        .filter(Boolean);
      return [conn, ...utilConn].filter(Boolean) as string[];
    });
    const gasProviders = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const prov = [val.gas_provider, val.gas_connection_type].filter(Boolean);
      const utilProv = (val.utility_details || [])
        .filter((u) => u.type === 'gas')
        .map((u) => [u.provider, u.connection_type].filter(Boolean).join(' '))
        .filter(Boolean);
      return [...prov, ...utilProv].filter(Boolean) as string[];
    });
    if (gasIds !== '—' || gasProviders !== '—') {
      const gasPayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : this.isUtilityIncluded('gas')
          ? { en: 'Leaser', ar: 'المؤجر' }
          : { en: 'Tenant', ar: 'المستأجر' };

      rows.push({
        name: 'Gas',
        nameAr: 'الغاز',
        identifier: gasIds,
        provider: gasProviders !== '—' ? gasProviders : 'Central / Cylinder',
        mode: '',
        payableBy: gasPayable.en,
        payableByAr: gasPayable.ar,
      });
    }

    // 5. Cooling / AC
    const coolingIds = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const acc = val.cooling_account_number;
      const utilAcc = (val.utility_details || [])
        .filter((u) => u.type === 'cooling')
        .map((u) => u.account_number || u.connection_number)
        .filter(Boolean);
      return [acc, ...utilAcc].filter(Boolean) as string[];
    });
    const coolingProviders = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      const prov = val.cooling_provider;
      const utilProv = (val.utility_details || [])
        .filter((u) => u.type === 'cooling')
        .map((u) => u.provider)
        .filter(Boolean);
      return [prov, ...utilProv].filter(Boolean) as string[];
    });
    if (coolingIds !== '—' || coolingProviders !== '—') {
      const coolingPayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : this.isUtilityIncluded('cooling')
          ? { en: 'Leaser', ar: 'المؤجر' }
          : { en: 'Tenant', ar: 'المستأجر' };

      rows.push({
        name: 'Cooling / AC',
        nameAr: 'التبريد والتكييف',
        identifier: coolingIds,
        provider: coolingProviders !== '—' ? coolingProviders : 'Split / Central AC',
        mode: '',
        payableBy: coolingPayable.en,
        payableByAr: coolingPayable.ar,
      });
    }

    // 6. Furniture
    const furnitureDetails = this.getCommaSeparatedValues((p) => {
      const val = this.propertyValue(p);
      return (val.utility_details || [])
        .filter((u) => u.type === 'furniture')
        .map((u) => u.details)
        .filter(Boolean) as string[];
    });
    if (furnitureDetails !== '—') {
      const furniturePayable = this.isOwnerAgreement
        ? { en: 'Owner', ar: 'المالك' }
        : { en: 'Leaser', ar: 'المؤجر' };

      rows.push({
        name: 'Furniture',
        nameAr: 'الأثاث',
        identifier: '—',
        provider: furnitureDetails,
        mode: '',
        payableBy: furniturePayable.en,
        payableByAr: furniturePayable.ar,
      });
    }

    return rows;
  }

  isUtilityIncluded(type: 'electricity' | 'water' | 'gas' | 'cooling'): boolean {
    const text = `${this.agreement?.notes || ''} ${this.agreement?.terms_text || ''}`.toLowerCase();
    if (type === 'electricity' || type === 'water') {
      return (
        text.includes('electricity') || text.includes('water') || text.includes('all utilities')
      );
    }
    if (type === 'cooling') {
      return (
        text.includes('cooling') || text.includes('chiller free') || text.includes('ac included')
      );
    }
    if (type === 'gas') {
      return text.includes('gas included') || text.includes('all utilities');
    }
    return false;
  }

  getCommaSeparatedValues(extractor: (p: PrintableProperty) => string[]): string {
    const values: string[] = [];
    for (const prop of this.properties) {
      const items = extractor(prop)
        .map((v) => String(v).trim())
        .filter(Boolean);
      for (const item of items) {
        if (!values.includes(item)) {
          values.push(item);
        }
      }
    }
    return values.length > 0 ? values.join(', ') : '—';
  }

  propertyUnitsInside(property: PrintableProperty): string {
    const name = this.getPropertyField(property, 'name');
    const building = this.getPropertyField(property, 'building_name');
    const code = this.getPropertyField(property, 'property_code');
    return building !== '—' ? building : name !== '—' ? name : code;
  }

  propertyFileAndCode(property: PrintableProperty): string {
    const name = this.getPropertyField(property, 'name');
    const code = this.getPropertyField(property, 'property_code');
    const fileNo = this.agreement?.file_no;
    const base = [name, code].filter((v) => v && v !== '—').join(' / ') || '—';
    return fileNo ? `${base} (File: ${fileNo})` : base;
  }

  formatPropertyType(type?: string | null): string {
    if (!type || type === '—') return '—';
    const map: Record<string, string> = {
      apartment: 'Apartment / شقة',
      villa: 'Villa / فيلا',
      shop: 'Shop / محل',
      office: 'Office / مكتب',
      space: 'Space / مساحة',
      labor_camp: 'Labor Camp / سكن عمال',
      warehouse: 'Warehouse / مستودع',
      land: 'Land / أرض',
      garage: 'Garage / كراج',
    };
    return map[type.toLowerCase()] || this.formatStatus(type);
  }

  formatPropertyUsage(usage?: string | null): string {
    if (!usage || usage === '—') return '—';
    const map: Record<string, string> = {
      residential: 'Residential',
      commercial: 'Commercial',
      others: 'Others',
    };
    return map[usage.toLowerCase()] || this.formatStatus(usage);
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
    if (useBusiness) return this.business.licenseId;
    const customer = this.partyCustomer(party);
    return this.display(customer?.identity_no || customer?.company_registration_no);
  }

  partyContact(party: PrintableParty | null, useBusiness: boolean): string {
    if (useBusiness) return this.business.contact;
    return this.display(this.partyCustomer(party)?.phone);
  }

  partyEmail(party: PrintableParty | null): string {
    return this.display(this.partyCustomer(party)?.email);
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
