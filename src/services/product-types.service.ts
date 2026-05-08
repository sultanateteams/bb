import { httpClient } from "@/services/httpClient";
import type { Product, ProductType, ProductUnit } from "@/pages/MahsulotTurlari/types";

type BackendResp<T> = { data: T; status: number; message?: string; error?: string };

type RawProductType = {
  id: number;
  name: string;
  production_type: string;
  unit: string;
  min_stock: number;
  inner_qty?: number | null;
  is_active: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

const PT_MAP: Record<string, ProductType> = {
  ich: "ICH",
  wl: "WL",
  tm: "TM",
};

const PT_REVERSE: Record<ProductType, string> = {
  ICH: "ich",
  WL: "wl",
  TM: "tm",
};

function toFrontend(r: RawProductType): Product {
  return {
    id: String(r.id),
    name: r.name,
    type: PT_MAP[r.production_type] ?? "ICH",
    unit: r.unit as ProductUnit,
    minStock: Number(r.min_stock),
    innerQty: r.inner_qty ?? undefined,
    isActive: r.is_active,
    description: r.description ?? undefined,
    createdAt: r.created_at.slice(0, 10),
  };
}

export async function getProductTypes(): Promise<Product[]> {
  const { data } = await httpClient.get<BackendResp<RawProductType[]>>("/product-types?limit=200");
  return (data.data || []).map(toFrontend);
}

export async function createProductType(p: Product): Promise<Product> {
  const body: Record<string, unknown> = {
    name: p.name,
    production_type: PT_REVERSE[p.type],
    unit: p.unit,
    min_stock: p.minStock,
  };
  if (p.description?.trim()) body.description = p.description.trim();
  if (p.innerQty != null) body.inner_qty = p.innerQty;

  const { data } = await httpClient.post<BackendResp<RawProductType>>("/product-types", body);
  return toFrontend(data.data);
}

export async function updateProductType(id: string, p: Partial<Product>): Promise<Product> {
  const body: Record<string, unknown> = {};
  if (p.name !== undefined) body.name = p.name;
  if (p.type !== undefined) body.production_type = PT_REVERSE[p.type];
  if (p.unit !== undefined) body.unit = p.unit;
  if (p.minStock !== undefined) body.min_stock = p.minStock;
  if (p.description !== undefined) body.description = p.description ?? "";
  if (p.innerQty !== undefined) body.inner_qty = p.innerQty;
  if (p.isActive !== undefined) body.is_active = p.isActive;

  const { data } = await httpClient.put<BackendResp<RawProductType>>(`/product-types/${id}`, body);
  return toFrontend(data.data);
}

export async function deleteProductType(id: string): Promise<void> {
  await httpClient.delete(`/product-types/${id}`);
}
