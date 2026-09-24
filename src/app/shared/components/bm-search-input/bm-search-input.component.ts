import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'bm-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="'relative ' + containerClass">
      <div
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
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
      </div>
      <input
        type="text"
        [value]="value"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        class="bm-input bm-input-search text-xs text-slate-900 placeholder:text-slate-400"
      />
      @if (value) {
        <button
          type="button"
          (click)="clear()"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      }
    </div>
  `,
})
export class BmSearchInputComponent implements OnInit, OnDestroy {
  @Input() value = '';
  @Input() placeholder = 'Search...';
  @Input() containerClass = 'w-full sm:w-80 md:w-96 max-w-lg';
  @Output() searchChange = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((val) => this.searchChange.emit(val));
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.searchSubject.next(val);
  }

  clear(): void {
    this.value = '';
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
