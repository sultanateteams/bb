interface RawMaterial {
  id: string;
  name: string;
  type: 'ICH' | 'WL';
  unit: 'kg' | 'litre' | 'dona';
  defaultPrice: number;   // so'mda
  minStock: number;
  description?: string;
  createdAt: string;
}

interface RawMaterialFormData {
  name: string;
  type: 'ICH' | 'WL' | '';
  unit: 'kg' | 'litre' | 'dona' | '';
  defaultPrice: number | '';
  minStock: number | '';
  description: string;
}

interface RawMaterialFilter {
  search: string;
  type: 'ALL' | 'ICH' | 'WL';
}

// Modal rejimlari
type ModalMode = 'add' | 'edit';

export type { RawMaterial, RawMaterialFormData, RawMaterialFilter, ModalMode };