import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OwnerAgreement, TenantAgreement } from '../../models/agreement.models';

type PrintableAgreement = OwnerAgreement | TenantAgreement;
type PrintableProperty = {
  name?: string | null;
  property_code?: string | null;
  unit_number?: string | null;
  property_type?: string | null;
  property?: PrintableProperty;
};

@Component({
  selector: 'bm-agreement-print-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="agreement-print-sheet" aria-label="Printable agreement">
      <header class="print-letterhead-space"></header>

      <header class="print-title">
        <h1>{{ isOwnerAgreement ? 'OWNER MANAGEMENT AGREEMENT' : 'TENANCY AGREEMENT' }}</h1>
        <p>{{ isOwnerAgreement ? 'اتفاقية إدارة عقار' : 'اتفاقية إيجار' }}</p>
        <div class="print-meta">
          <span><b>Agreement No. / رقم الاتفاقية:</b> {{ agreement.agreement_no }}</span>
          <span><b>Status / الحالة:</b> {{ formatStatus(agreement.status) }}</span>
        </div>
      </header>

      <section class="print-parties print-grid">
        <div class="print-party">
          <h2>
            {{ isOwnerAgreement ? 'FIRST PARTY / الطرف الأول' : 'FIRST PARTY / الطرف الأول' }}
          </h2>
          <p class="print-party-name">{{ firstPartyName }}</p>
          <p>{{ firstPartyRole }}</p>
          <p *ngIf="!isOwnerAgreement">TRN: {{ business.trn }} | EID: {{ business.eid }}</p>
          <p *ngIf="!isOwnerAgreement">{{ business.address }}</p>
          <p *ngIf="!isOwnerAgreement">Phone / الهاتف: {{ business.phone }}</p>
        </div>
        <div class="print-party">
          <h2>SECOND PARTY / الطرف الثاني</h2>
          <p class="print-party-name">{{ secondPartyName }}</p>
          <p>{{ secondPartyRole }}</p>
          <p *ngIf="isOwnerAgreement">TRN: {{ business.trn }} | EID: {{ business.eid }}</p>
          <p *ngIf="isOwnerAgreement">{{ business.address }}</p>
          <p *ngIf="isOwnerAgreement">Phone / الهاتف: {{ business.phone }}</p>
        </div>
      </section>

      <section class="print-section">
        <h2>AGREEMENT DETAILS / تفاصيل الاتفاقية</h2>
        <table class="print-table">
          <tbody>
            <tr>
              <th>Agreement Period<br /><span>مدة الاتفاقية</span></th>
              <td>{{ agreement.start_date }} — {{ agreement.end_date }}</td>
            </tr>
            <tr>
              <th>Payment Terms<br /><span>شروط الدفع</span></th>
              <td>
                {{ agreement.payment_count }}
                {{ agreement.payment_frequency || 'payment cycles' }} ·
                {{ agreement.payment_mode | titlecase }}
              </td>
            </tr>
            <tr>
              <th>Total Amount<br /><span>المبلغ الإجمالي</span></th>
              <td>{{ agreement.currency_code || 'AED' }} {{ agreement.total_amount }}</td>
            </tr>
            <tr>
              <th>Properties<br /><span>العقارات</span></th>
              <td>{{ propertySummary }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <h2>PROPERTY SCHEDULE / جدول العقارات</h2>
        <table class="print-table print-properties">
          <thead>
            <tr>
              <th>#</th>
              <th>Property / العقار</th>
              <th>Code / الرمز</th>
              <th>Unit / الوحدة</th>
              <th>Type / النوع</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of properties; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ getPropertyField(property, 'name') }}</td>
              <td>{{ getPropertyField(property, 'property_code') }}</td>
              <td>{{ getPropertyField(property, 'unit_number') }}</td>
              <td>{{ getPropertyField(property, 'property_type') }}</td>
            </tr>
            <tr *ngIf="properties.length === 0">
              <td colspan="5">No property details recorded / لا توجد تفاصيل عقار مسجلة</td>
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
              <th>Amount / المبلغ</th>
              <th>Status / الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of agreement.installments">
              <td>{{ item.installment_no }}</td>
              <td>{{ item.due_date }}</td>
              <td>{{ agreement.currency_code || 'AED' }} {{ item.amount }}</td>
              <td>{{ item.status | titlecase }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section print-clauses">
        <h2>TERMS AND CONDITIONS / الشروط والأحكام</h2>
        <div class="print-clause print-grid" *ngFor="let clause of clauses; let i = index">
          <div>
            <b>{{ i + 1 }}. {{ clause.en }}</b>
          </div>
          <div dir="rtl">
            <b>{{ i + 1 }}. {{ clause.ar }}</b>
          </div>
        </div>
      </section>

      <section class="print-signatures print-grid">
        <div>
          <h2>FIRST PARTY SIGNATURE / توقيع الطرف الأول</h2>
          <div class="signature-line"></div>
          <p>Name / الاسم: __________________________</p>
          <p>Date / التاريخ: _________________________</p>
        </div>
        <div>
          <h2>SECOND PARTY SIGNATURE / توقيع الطرف الثاني</h2>
          <div class="signature-line"></div>
          <p>Name / الاسم: __________________________</p>
          <p>Date / التاريخ: _________________________</p>
        </div>
      </section>

      <footer class="print-footer">
        <p>Baithul Madeena Real Estate · Official Agreement Copy</p>
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
        font-size: 10pt;
        line-height: 1.45;
      }
      .print-letterhead-space {
        height: 28mm;
        border-bottom: 1px solid #000;
        margin-bottom: 7mm;
      }
      .print-title {
        text-align: center;
        border-bottom: 1px solid #000;
        padding-bottom: 4mm;
        margin-bottom: 5mm;
      }
      .print-title h1 {
        font-size: 16pt;
        margin: 0;
        letter-spacing: 0.04em;
      }
      .print-title p {
        margin: 2mm 0 4mm;
        font-size: 12pt;
      }
      .print-meta {
        display: flex;
        justify-content: space-between;
        gap: 8mm;
        text-align: left;
        font-size: 9pt;
      }
      .print-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7mm;
      }
      .print-party {
        border: 1px solid #000;
        padding: 4mm;
        min-height: 28mm;
      }
      .print-party h2,
      .print-section h2,
      .print-signatures h2 {
        font-size: 10pt;
        margin: 0 0 3mm;
        font-weight: 700;
      }
      .print-party p {
        margin: 1mm 0;
      }
      .print-party-name {
        font-size: 11pt;
        font-weight: 700;
      }
      .print-section {
        margin-top: 6mm;
        break-inside: avoid;
      }
      .print-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .print-table th,
      .print-table td {
        border: 1px solid #000;
        padding: 2.5mm;
        vertical-align: top;
        text-align: left;
      }
      .print-table th {
        width: 32%;
        font-weight: 700;
      }
      .print-table th span {
        font-weight: 400;
      }
      .print-properties th {
        width: auto;
      }
      .print-properties th:first-child,
      .print-properties td:first-child {
        width: 7%;
        text-align: center;
      }
      .print-clauses {
        break-inside: auto;
      }
      .print-clause {
        border: 1px solid #000;
        border-bottom: 0;
        padding: 3mm;
        gap: 0;
        break-inside: avoid;
      }
      .print-clause:last-child {
        border-bottom: 1px solid #000;
      }
      .print-clause > div {
        padding: 0 3mm;
      }
      .print-clause > div + div {
        border-left: 1px solid #000;
      }
      .print-signatures {
        margin-top: 16mm;
        break-inside: avoid;
      }
      .print-signatures > div {
        min-height: 35mm;
      }
      .signature-line {
        border-bottom: 1px solid #000;
        height: 15mm;
        margin-bottom: 3mm;
      }
      .print-signatures p {
        margin: 1mm 0;
      }
      .print-footer {
        border-top: 1px solid #000;
        margin-top: 12mm;
        padding-top: 3mm;
        text-align: center;
        font-size: 8pt;
      }
      @media print {
        .agreement-print-sheet {
          display: block !important;
        }
        @page {
          size: A4;
          margin: 12mm 14mm;
        }
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
  @Input() isOwnerAgreement = false;
  @Input() properties: PrintableProperty[] = [];

  readonly business = {
    trn: '100000000000003',
    eid: '784-0000-0000000-0',
    address: 'Office 000, Business Bay, Dubai, United Arab Emirates',
    phone: '+971 4 000 0000',
  };

  readonly clauses = [
    {
      en: 'The parties confirm that the information in this agreement is accurate and complete.',
      ar: 'يقر الطرفان بأن المعلومات الواردة في هذه الاتفاقية صحيحة وكاملة.',
    },
    {
      en: 'The property shall be used only for the approved purpose and in accordance with applicable law.',
      ar: 'يُستخدم العقار للغرض المعتمد ووفقاً للقوانين واللوائح المعمول بها.',
    },
    {
      en: 'Amounts and payment dates shall follow the approved schedule recorded in the ERP.',
      ar: 'تخضع المبالغ وتواريخ الدفع للجدول المعتمد والمسجل في النظام.',
    },
    {
      en: 'Any change, extension, hold or termination must follow the approved agreement process.',
      ar: 'يجب أن تتم أي إضافة أو تمديد أو تعليق أو إنهاء وفقاً لإجراءات الاتفاقية المعتمدة.',
    },
    {
      en: 'Each party shall notify the other party of material changes to its contact details.',
      ar: 'يلتزم كل طرف بإخطار الطرف الآخر بأي تغيير جوهري في بيانات الاتصال.',
    },
    {
      en: 'This agreement is subject to the applicable laws and jurisdiction of the United Arab Emirates.',
      ar: 'تخضع هذه الاتفاقية للقوانين والاختصاص القضائي المعمول بهما في دولة الإمارات العربية المتحدة.',
    },
  ];

  get propertySummary(): string {
    return (
      this.properties
        .map((property) =>
          String(
            this.propertyValue(property).name || this.propertyValue(property).property_code || '—',
          ),
        )
        .join(', ') || '—'
    );
  }

  propertyValue(property: PrintableProperty): PrintableProperty {
    return property.property || property;
  }

  getPropertyField(
    property: PrintableProperty,
    field: 'name' | 'property_code' | 'unit_number' | 'property_type',
  ): string {
    const target = property.property || property;
    const value = target[field];
    return value ? String(value) : '—';
  }

  formatStatus(status: string): string {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
