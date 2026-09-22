import { Branch } from '../branch-context/branch.models';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  branches: Branch[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
