import { Branch } from '../../core/branch-context/branch.models';

export interface UserAdmin {
  id: number;
  name: string;
  email: string;
  roles: string[];
  branches: Branch[];
  status: 'active' | 'inactive';
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoleAdmin {
  id: number;
  name: string;
  label: string;
  description: string;
  permissions: string[];
}
