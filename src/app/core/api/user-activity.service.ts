import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { BranchContextService } from '../branch-context/branch-context.service';

export type UserActivityAction =
  | 'opened'
  | 'viewed'
  | 'printed'
  | 'downloaded'
  | 'updated'
  | 'created'
  | 'approved'
  | 'commenced'
  | 'drafted'
  | 'deleted';

@Injectable({ providedIn: 'root' })
export class UserActivityService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private branchContext = inject(BranchContextService);

  track(action: UserActivityAction, page: string, metadata: Record<string, string> = {}): void {
    if (!this.auth.isAuthenticated() || !this.branchContext.activeBranchId()) return;

    this.http
      .post(
        '/api/v1/activity-logs',
        { action, page: page.slice(0, 255), metadata },
        {
          headers: new HttpHeaders({ 'X-Skip-Loader': '1' }),
        },
      )
      .subscribe({ error: () => undefined });
  }
}
