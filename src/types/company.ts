export type Company = {
  id: number;
  name: string;
  nip?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at?: string;
  ksef_connected?: boolean;
  ksef_metadata?: string | null;
};
