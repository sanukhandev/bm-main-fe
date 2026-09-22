export interface ApiResponse<T> {
  data: T;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  request_id?: string;
  errors?: Record<string, string[]>;
}

export interface ListQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  [key: string]: any;
}
