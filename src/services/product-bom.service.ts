import { httpClient } from "@/services/httpClient";

type BackendResp<T> = { data: T; status: number; message?: string };

export interface ProductBOMItem {
  id: number;
  product_type_id: number;
  raw_material_type_id: number;
  qty_per_unit: number;
  note?: string;
}

export interface SyncBOMPayload {
  product_type_id: number;
  items: { raw_material_type_id: number; qty_per_unit: number; note?: string }[];
}

export interface WLServiceFee {
  id?: number;
  product_type_id: number;
  fee_per_unit: number;
}

export async function getProductBOM(productTypeId: number): Promise<ProductBOMItem[]> {
  const { data } = await httpClient.get<BackendResp<ProductBOMItem[]>>(
    `/product-bom?product_type_id=${productTypeId}`,
  );
  return data.data || [];
}

export async function syncProductBOM(payload: SyncBOMPayload): Promise<ProductBOMItem[]> {
  const { data } = await httpClient.post<BackendResp<ProductBOMItem[]>>("/product-bom/sync", payload);
  return data.data || [];
}

export async function getWLServiceFee(productTypeId: number): Promise<WLServiceFee> {
  const { data } = await httpClient.get<BackendResp<WLServiceFee>>(
    `/wl-service-fees/${productTypeId}`,
  );
  return data.data;
}

export async function upsertWLServiceFee(productTypeId: number, feePerUnit: number): Promise<WLServiceFee> {
  const { data } = await httpClient.put<BackendResp<WLServiceFee>>(
    `/wl-service-fees/${productTypeId}`,
    { fee_per_unit: feePerUnit },
  );
  return data.data;
}

// ── Price tiers ──────────────────────────────────────────────────────

export interface PriceTierItem {
  id: number;
  product_type_id: number;
  shop_category: string;
  qty_from: number;
  qty_to?: number | null;
  unit_price: number;
}

export interface SyncPriceTiersPayload {
  product_type_id: number;
  tiers: { shop_category: string; qty_from: number; qty_to?: number | null; unit_price: number }[];
}

export async function getPriceTiers(productTypeId: number): Promise<PriceTierItem[]> {
  const { data } = await httpClient.get<BackendResp<PriceTierItem[]>>(
    `/price-tiers?product_type_id=${productTypeId}`,
  );
  return data.data || [];
}

export async function syncPriceTiers(payload: SyncPriceTiersPayload): Promise<PriceTierItem[]> {
  const { data } = await httpClient.post<BackendResp<PriceTierItem[]>>("/price-tiers/sync", payload);
  return data.data || [];
}
