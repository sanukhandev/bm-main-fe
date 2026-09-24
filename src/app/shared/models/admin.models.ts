import { Branch } from '../../core/branch-context/branch.models';

export interface UserAdmin {
  id: number;
  name: string;
  email: string;
  roles: string[];
  branches: Branch[];
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserAdminPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  branch_ids: number[];
  roles: string[];
}

export interface RoleAdmin {
  id: number;
  name: string;
  label: string;
  description: string;
  permissions: string[];
}
