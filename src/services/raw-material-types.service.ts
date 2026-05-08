import { httpClient } from "@/services/httpClient";
import type { RawMaterial } from "@/pages/XomashiyoTurlari/types";

type BackendResp<T> = { data: T; status: number; message?: string; error?: string };

type RawRow = {
  id: number;
  name: string;
  production_type: string;
  unit: string;
  standard_price: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
};

const TYPE_MAP: Record<string, "ICH" | "WL"> = { ich: "ICH", wl: "WL" };
const TYPE_REV: Record<string, string> = { ICH: "ich", WL: "wl" };

function toFrontend(r: RawRow): RawMaterial {
  return {
    id: String(r.id),
    name: r.name,
    type: TYPE_MAP[r.production_type] ?? "ICH",
    unit: r.unit as RawMaterial["unit"],
    defaultPrice: Number(r.standard_price),
    minStock: Number(r.min_stock),
    createdAt: r.created_at.slice(0, 10),
  };
}

export async function getRawMaterialTypes(): Promise<RawMaterial[]> {
  const { data } = await httpClient.get<BackendResp<RawRow[]>>("/raw-material-types?limit=200");
  return (data.data || []).map(toFrontend);
}

export async function createRawMaterialType(m: RawMaterial): Promise<RawMaterial> {
  const { data } = await httpClient.post<BackendResp<RawRow>>("/raw-material-types", {
    name: m.name,
    production_type: TYPE_REV[m.type] ?? m.type.toLowerCase(),
    unit: m.unit,
    standard_price: m.defaultPrice,
    min_stock: m.minStock,
  });
  return toFrontend(data.data);
}

export async function updateRawMaterialType(id: string, m: Partial<RawMaterial>): Promise<RawMaterial> {
  const body: Record<string, unknown> = {};
  if (m.name !== undefined) body.name = m.name;
  if (m.type !== undefined) body.production_type = TYPE_REV[m.type] ?? m.type.toLowerCase();
  if (m.unit !== undefined) body.unit = m.unit;
  if (m.defaultPrice !== undefined) body.standard_price = m.defaultPrice;
  if (m.minStock !== undefined) body.min_stock = m.minStock;

  const { data } = await httpClient.put<BackendResp<RawRow>>(`/raw-material-types/${id}`, body);
  return toFrontend(data.data);
}

export async function deleteRawMaterialType(id: string): Promise<void> {
  await httpClient.delete(`/raw-material-types/${id}`);
}
