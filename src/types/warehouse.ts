export interface Warehouse {
  id: number;
  company_id: number;
  name: string;
  location_code_prefix: string | null;
  description: string | null;
  address: string | null;
  manager_name: string | null;
  is_active: number;
  created_at: string;
}

export interface NewWarehouse {
  company_id: number;
  name: string;
  location_code_prefix: string | null;
  description: string | null;
  address: string | null;
  manager_name: string | null;
  is_active: number;
  created_at: string;
}

export interface UpdateWarehouse {
  name?: string | null;
  location_code_prefix?: string | null;
  description?: string | null;
  address?: string | null;
  manager_name?: string | null;
  is_active?: number;
}
