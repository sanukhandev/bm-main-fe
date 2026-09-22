import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BmLoadingService {
  private activeHttpCount = signal(0);
  private routeLoadingState = signal(false);

  /**
   * Computed boolean indicating whether any HTTP request or router navigation is in progress
   */
  isLoading = computed(() => this.activeHttpCount() > 0 || this.routeLoadingState());
  isHttpLoading = computed(() => this.activeHttpCount() > 0);
  isRouteLoading = computed(() => this.routeLoadingState());

  showHttpLoader(): void {
    this.activeHttpCount.update((count) => count + 1);
  }

  hideHttpLoader(): void {
    this.activeHttpCount.update((count) => Math.max(0, count - 1));
  }

  setRouteLoading(loading: boolean): void {
    this.routeLoadingState.set(loading);
  }

  resetAll(): void {
    this.activeHttpCount.set(0);
    this.routeLoadingState.set(false);
  }
}
