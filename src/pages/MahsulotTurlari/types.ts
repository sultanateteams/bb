export type ProductType = "ICH" | "WL" | "TM";
export type ProductUnit = "dona" | "upak" | "kg";
export type PriceCategory = "retail" | "dealer" | "vip";
export type ModalTab = "info" | "bom" | "pricing";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  unit: ProductUnit;
  minStock: number;
  description?: string;
  createdAt: string;
}

export interface BOMItem {
  id?: string;
  rawMaterialId: string;
  rawMaterialName: string;
  unit: string;
  quantityPer1Unit: number;
}

export interface WLProductBOM {
  items: BOMItem[];
  serviceChargePerUnit: number;
}

export interface TMProductInfo {
  unitsPerPackage?: number;
}

export interface PriceTier {
  id?: string;
  fromQty: number;
  toQty: number | null;
  price: number;
}

export interface CategoryPricing {
  category: PriceCategory;
  tiers: PriceTier[];
}

export interface ProductPricing {
  productId: string;
  categories: CategoryPricing[];
}

export interface ProductFilter {
  search: string;
  type: "ALL" | ProductType;
}
