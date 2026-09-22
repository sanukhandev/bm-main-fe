import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { Customer } from '../../shared/models/customer.models';

@Component({
  selector: 'bm-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmCardComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadCustomer()"></bm-error-state>
    } @else if (customer()) {
      <bm-page-header
        [title]="customer()!.display_name"
        [subtitle]="'Customer Code: ' + customer()!.customer_code"
      >
        <a routerLink="/app/customers" class="bm-btn bm-btn-secondary text-xs">
          Back to List
        </a>
        <a [routerLink]="['/app/customers', customer()!.id, 'edit']" class="bm-btn bm-btn-primary text-xs">
          Edit Customer
        </a>
      </bm-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <bm-card title="Overview & Roles">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div class="text-slate-400 font-medium">Customer Type</div>
                <div class="mt-1">
                  <bm-status-badge [status]="customer()!.customer_type"></bm-status-badge>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Legal Name</div>
                <div class="font-semibold text-slate-800 mt-1">{{ customer()!.legal_name || '—' }}</div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Status</div>
                <div class="mt-1">
                  <bm-status-badge [status]="customer()!.status"></bm-status-badge>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Business Roles</div>
                <div class="flex gap-1.5 mt-1 flex-wrap">
                  @for (r of customer()!.roles || []; track r) {
                    <bm-status-badge [status]="r"></bm-status-badge>
                  }
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">TRN Registration</div>
                <div class="font-semibold text-slate-800 mt-1 tabular-nums">{{ customer()!.tax_registration_no || '—' }}</div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Identity / Reg No</div>
                <div class="font-semibold text-slate-800 mt-1 tabular-nums">
                  {{ customer()!.identity_no || customer()!.company_registration_no || '—' }}
                </div>
              </div>
            </div>
          </bm-card>

          <bm-card title="Location & Address">
            <div class="text-xs space-y-2 text-slate-700">
              <div>{{ customer()!.address_line_1 || 'No street address provided.' }}</div>
              @if (customer()!.address_line_2) {
                <div>{{ customer()!.address_line_2 }}</div>
              }
              <div class="font-medium text-slate-900">
                {{ customer()!.city || '' }} {{ customer()!.state_or_emirate ? ', ' + customer()!.state_or_emirate : '' }} {{ customer()!.country_code ? ' (' + customer()!.country_code + ')' : '' }}
              </div>
            </div>
          </bm-card>
        </div>

        <div>
          <bm-card title="Contact Information">
            <div class="space-y-4 text-xs">
              <div>
                <div class="text-slate-400 font-medium">Phone</div>
                <div class="font-semibold text-slate-900 mt-1 tabular-nums">{{ customer()!.phone || '—' }}</div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Email</div>
                <div class="font-semibold text-slate-900 mt-1">{{ customer()!.email || '—' }}</div>
              </div>

              <div class="border-t border-slate-100 pt-3">
                <div class="text-slate-400 font-medium mb-1">Notes</div>
                <p class="text-slate-600 leading-relaxed italic">{{ customer()!.notes || 'No additional notes.' }}</p>
              </div>
            </div>
          </bm-card>
        </div>
      </div>
    }
  `,
})
export class CustomerDetailComponent implements OnInit {
  private api = inject(CustomersApiService);
  private route = inject(ActivatedRoute);

  customer = signal<Customer | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCustomer();
  }

  loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getCustomer(id).subscribe({
      next: (res) => {
        this.customer.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Customer not found.');
        this.isLoading.set(false);
      },
    });
  }
}
