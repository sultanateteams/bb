import { httpClient } from "@/services/httpClient";

type BackendResp<T> = { data: T; status: number; message?: string; error?: string };

export interface ProductBOMEnrichedItem {
  id: number;
  product_type_id: number;
  raw_material_type_id: number;
  raw_material_name: string;
  unit: string;
  qty_per_unit: number;
  current_stock: number;
  note?: string;
}

export interface WLProductionItemReq {
  product_type_id: number;
  quantity: number;
}

export interface CreateWLProductionReq {
  sent_date: string;
  notes?: string;
  items: WLProductionItemReq[];
}

export interface ReceiveWLProductionReq {
  received_quantity: number;
  price_per_unit: number;
}

export interface WLProductionItemResp {
  id: number;
  product_type_id: number;
  product_name: string;
  unit: string;
  quantity: number;
}

export interface WLProductionMaterialResp {
  id: number;
  raw_material_type_id: number;
  raw_material_name: string;
  unit: string;
  quantity_used: number;
  standard_price: number;
}

export interface WLProductionResp {
  id: number;
  wl_code: string;
  sent_date: string;
  status: string;
  received_quantity?: number;
  price_per_unit?: number;
  notes?: string;
  items: WLProductionItemResp[];
  materials: WLProductionMaterialResp[];
  created_at: string;
}

export interface WLProductionListItem {
  id: number;
  wl_code: string;
  sent_date: string;
  product_names: string;
  total_quantity: number;
  unit: string;
  status: string;
  received_quantity?: number;
  price_per_unit?: number;
  item_count: number;
  created_at: string;
}

export interface WLProductionsListResp {
  productions: WLProductionListItem[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export async function getProductBOMEnriched(productTypeId: number): Promise<ProductBOMEnrichedItem[]> {
  const { data } = await httpClient.get<BackendResp<ProductBOMEnrichedItem[]>>(
    `/product-bom/enriched?product_type_id=${productTypeId}`,
  );
  return data.data || [];
}

export async function createWLProduction(req: CreateWLProductionReq): Promise<WLProductionResp> {
  const { data } = await httpClient.post<BackendResp<WLProductionResp>>("/wl-productions", req);
  return data.data;
}

export async function listWLProductions(params?: { page?: number; limit?: number; status?: string }): Promise<WLProductionsListResp> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status) q.set("status", params.status);
  const { data } = await httpClient.get<BackendResp<WLProductionsListResp>>(
    `/wl-productions?${q.toString()}`,
  );
  return data.data;
}

export async function getWLProduction(id: number): Promise<WLProductionResp> {
  const { data } = await httpClient.get<BackendResp<WLProductionResp>>(`/wl-productions/${id}`);
  return data.data;
}

export async function receiveWLProduction(id: number, req: ReceiveWLProductionReq): Promise<WLProductionResp> {
  const { data } = await httpClient.post<BackendResp<WLProductionResp>>(
    `/wl-productions/${id}/receive`,
    req,
  );
  return data.data;
}
