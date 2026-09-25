import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface ComboboxOption {
  id: number | string;
  label: string;
  code?: string;
  subtitle?: string;
  badge?: string;
  [key: string]: any;
}

@Component({
  selector: 'bm-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BmComboboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full" #comboboxContainer>
      <!-- COMBOSBOX TRIGGER BOX -->
      <div
        (click)="toggleOpen()"
        [class.border-emerald-600]="isOpen()"
        [class.ring-4]="isOpen()"
        [class.ring-emerald-500/10]="isOpen()"
        [class.border-rose-400]="invalid"
        [class.bg-slate-50]="isDisabled || locked"
        [class.cursor-not-allowed]="isDisabled || locked"
        [class.cursor-pointer]="!isDisabled && !locked"
        class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs flex items-center justify-between gap-2 transition-all duration-150 select-none"
      >
        <div class="flex items-center gap-2 truncate min-w-0 flex-1">
          @if (selectedOption()) {
            @if (selectedOption()?.code) {
              <span
                class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold tracking-tight shrink-0 border border-slate-200/80"
              >
                {{ selectedOption()?.code }}
              </span>
            }
            <span class="truncate font-semibold text-slate-900 text-sm">
              {{ selectedOption()?.label }}
            </span>
            @if (selectedOption()?.subtitle) {
              <span class="truncate text-xs text-slate-400 font-normal hidden sm:inline">
                · {{ selectedOption()?.subtitle }}
              </span>
            }
          } @else {
            <span class="text-slate-400 font-normal truncate">{{ placeholder }}</span>
          }
        </div>

        <div class="flex items-center gap-1.5 shrink-0 text-slate-400">
          @if (clearable && selectedOption() && !isDisabled && !locked) {
            <button
              type="button"
              (click)="clearSelection($event)"
              title="Clear selection"
              class="w-5 h-5 rounded-full hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          }

          <svg
            [class.rotate-180]="isOpen()"
            class="h-4 w-4 transition-transform duration-200 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <!-- SEARCHABLE DROPDOWN POPOVER -->
      @if (isOpen()) {
        <div
          class="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in text-xs font-sans max-h-72 flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- SEARCH FILTER INPUT HEADER -->
          <div class="p-2.5 bg-slate-50/90 border-b border-slate-100 sticky top-0 z-10">
            <div class="relative flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 absolute left-3 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                [placeholder]="searchPlaceholder"
                class="w-full h-9 pl-9 pr-8 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-medium"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''; onSearchChange()"
                  class="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              }
            </div>
          </div>

          <!-- OPTIONS LIST -->
          <div class="overflow-y-auto divide-y divide-slate-50 p-1 flex-1">
            @if (filteredOptions().length > 0) {
              @for (opt of filteredOptions(); track opt.id) {
                <div
                  (click)="select(opt)"
                  [class.bg-emerald-50]="selectedValue() === opt.id"
                  [class.text-emerald-900]="selectedValue() === opt.id"
                  class="px-3.5 py-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition flex items-center justify-between gap-3 group"
                >
                  <div class="flex items-center gap-2.5 truncate min-w-0">
                    @if (opt.code) {
                      <span
                        [class.bg-emerald-100]="selectedValue() === opt.id"
                        [class.text-emerald-800]="selectedValue() === opt.id"
                        class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold tracking-tight shrink-0 border border-slate-200/60"
                      >
                        {{ opt.code }}
                      </span>
                    }
                    <div class="truncate">
                      <div
                        [class.font-bold]="selectedValue() === opt.id"
                        class="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors"
                      >
                        {{ opt.label }}
                      </div>
                      @if (opt.subtitle) {
                        <div class="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                          {{ opt.subtitle }}
                        </div>
                      }
                    </div>
                  </div>

                  @if (selectedValue() === opt.id) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-emerald-600 shrink-0 font-bold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  }
                </div>
              }
            } @else {
              <div class="py-8 px-4 text-center text-xs text-slate-400 font-normal">
                {{ emptyMessage }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class BmComboboxComponent implements ControlValueAccessor, OnChanges {
  private elementRef = inject(ElementRef);

  @Input() options: ComboboxOption[] = [];
  @Input() placeholder = 'Select option...';
  @Input() searchPlaceholder = 'Search by name, code, phone...';
  @Input() emptyMessage = 'No matching results found';
  @Input() invalid = false;
  @Input() clearable = true;
  @Input() locked = false;

  @Output() change = new EventEmitter<number | string | null>();
  @Output() selectOption = new EventEmitter<ComboboxOption | null>();

  selectedValue = signal<number | string | null>(null);
  private optionsVersion = signal(0);
  isOpen = signal(false);
  searchQuery = '';
  isDisabled = false;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  selectedOption = computed(() => {
    this.optionsVersion();
    const val = this.selectedValue();
    if (val === null || val === undefined || val === '') return null;
    return this.options.find((opt) => String(opt.id) === String(val)) || null;
  });

  filteredOptions = computed(() => {
    this.optionsVersion();
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.options;
    return this.options.filter((opt) => {
      const labelMatch = (opt.label || '').toLowerCase().includes(query);
      const codeMatch = (opt.code || '').toLowerCase().includes(query);
      const subMatch = (opt.subtitle || '').toLowerCase().includes(query);
      return labelMatch || codeMatch || subMatch;
    });
  });

  writeValue(value: any): void {
    this.selectedValue.set(value !== undefined && value !== null ? value : null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) this.isOpen.set(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) this.optionsVersion.update((version) => version + 1);
  }

  toggleOpen(): void {
    if (this.isDisabled || this.locked) return;
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      this.searchQuery = '';
      setTimeout(() => {
        const input = this.elementRef.nativeElement.querySelector('input');
        if (input) input.focus();
      }, 50);
    } else {
      this.onTouched();
    }
  }

  select(option: ComboboxOption): void {
    const val = option.id;
    this.selectedValue.set(val);
    this.onChange(val);
    this.change.emit(val);
    this.selectOption.emit(option);
    this.isOpen.set(false);
    this.onTouched();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue.set(null);
    this.onChange(null);
    this.change.emit(null);
    this.selectOption.emit(null);
    this.onTouched();
  }

  onSearchChange(): void {
    // Filtered options updates automatically via signal
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.onTouched();
      }
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }
}
