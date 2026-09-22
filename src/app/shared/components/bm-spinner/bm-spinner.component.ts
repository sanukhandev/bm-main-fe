import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2" [class.flex-col]="stacked" [class.justify-center]="centered">
      <svg
        [class]="spinnerClass"
        class="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3.5"
        ></circle>
        <path
          class="opacity-95"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      @if (label) {
        <span [class]="labelClass">{{ label }}</span>
      }
    </div>
  `,
})
export class BmSpinnerComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'emerald' | 'white' | 'slate' | 'amber' = 'emerald';
  @Input() label?: string;
  @Input() stacked = false;
  @Input() centered = false;

  get spinnerClass(): string {
    const sizeClasses = {
      xs: 'w-3.5 h-3.5',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-7 h-7',
      xl: 'w-10 h-10',
    };

    const colorClasses = {
      emerald: 'text-emerald-600',
      white: 'text-white',
      slate: 'text-slate-500',
      amber: 'text-amber-600',
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  get labelClass(): string {
    const sizeClasses = {
      xs: 'text-xs font-medium',
      sm: 'text-xs font-medium',
      md: 'text-sm font-medium',
      lg: 'text-base font-semibold',
      xl: 'text-lg font-semibold',
    };

    const colorClasses = {
      emerald: 'text-emerald-700',
      white: 'text-white',
      slate: 'text-slate-600',
      amber: 'text-amber-700',
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }
}
