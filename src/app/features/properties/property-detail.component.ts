import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Property } from '../../shared/models/property.models';

@Component({
  selector: 'bm-property-detail',
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
      <bm-loading-state type="detail"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadProperty()"></bm-error-state>
    } @else if (property()) {
      <bm-page-header
        [title]="property()!.name"
        [subtitle]="
          'Property Code: ' +
          property()!.property_code +
          ' | Property / Unit No.: ' +
          property()!.unit_number
        "
      >
        <a routerLink="/app/properties" class="bm-btn bm-btn-secondary text-xs"> Back to List </a>
        <a
          [routerLink]="['/app/properties', property()!.id, 'edit']"
          class="bm-btn bm-btn-primary text-xs"
        >
          Edit Property
        </a>
      </bm-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <bm-card title="Property Asset Specifications">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div class="text-slate-400 font-medium">Property Code</div>
                <div class="font-semibold text-slate-800 mt-1 tabular-nums">
                  {{ property()!.property_code }}
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Property / Unit No.</div>
                <div class="font-semibold text-slate-800 mt-1 tabular-nums">
                  {{ property()!.unit_number }}
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Property Classification</div>
                <div class="mt-1">
                  <bm-status-badge [status]="property()!.property_type"></bm-status-badge>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Building / Complex</div>
                <div class="font-semibold text-slate-800 mt-1">
                  {{ property()!.building_name || '—' }}
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Area Size</div>
                <div class="font-semibold text-slate-800 mt-1 tabular-nums">
                  {{ property()!.area || '—' }} sq ft
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium">Status</div>
                <div class="mt-1">
                  <bm-status-badge [status]="property()!.status"></bm-status-badge>
                </div>
              </div>
            </div>
          </bm-card>

          <bm-card title="Address & Location">
            <div class="text-xs space-y-2 text-slate-700">
              <div>{{ property()!.address_line_1 || 'No street address provided.' }}</div>
              @if (property()!.address_line_2) {
                <div>{{ property()!.address_line_2 }}</div>
              }
              <div class="font-medium text-slate-900">
                {{ property()!.city || '' }}
                {{ property()!.state_or_emirate ? ', ' + property()!.state_or_emirate : '' }}
              </div>
            </div>
          </bm-card>
        </div>

        <div>
          <bm-card title="Property Owner">
            <div class="text-xs space-y-3">
              <div>
                <div class="text-slate-400 font-medium">Owner Name</div>
                <div class="font-semibold text-slate-900 mt-1">{{ ownerName() }}</div>
              </div>

              @if (ownerCustomer()) {
                <div>
                  <div class="text-slate-400 font-medium">Customer Code</div>
                  <div class="font-semibold text-slate-800 mt-1 tabular-nums">
                    {{ ownerCustomer()?.customer_code }}
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <a
                    [routerLink]="['/app/customers', ownerCustomer()?.id]"
                    class="text-emerald-700 hover:text-emerald-900 font-semibold text-xs"
                  >
                    View Owner Master Profile &rarr;
                  </a>
                </div>
              }
            </div>
          </bm-card>
        </div>
      </div>
    }
  `,
})
export class PropertyDetailComponent implements OnInit {
  private api = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);

  property = signal<Property | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProperty();
  }

  loadProperty(silent = false): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    if (!silent && !this.property()) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getProperty(id).subscribe({
      next: (res) => {
        this.property.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Property record not found.');
        this.isLoading.set(false);
      },
    });
  }

  formatType(val: string): string {
    return (val || '').replace(/_/g, ' ');
  }

  ownerCustomer(): any {
    const p = this.property();
    if (!p || !p.owner) return null;
    if ('data' in p.owner && p.owner.data) return p.owner.data;
    if ('id' in p.owner) return p.owner;
    return null;
  }

  ownerName(): string {
    const oc = this.ownerCustomer();
    return oc ? oc.display_name : '—';
  }
}
