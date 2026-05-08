import { httpClient } from "@/services/httpClient";
import type { Dealer } from "@/pages/Diler/types";
import type { Store } from "@/pages/Dokon/types";
import type { SalesAgent } from "@/pages/SavdoVakili/types";
import type { Driver } from "@/pages/Haydovchi/types";

type BackendResponse<T> = { data: T; status: number; message?: string; error?: string };
type OptStr = string | null | undefined;

const s = (v: OptStr) => v ?? "";

const toDealer = (i: any): Dealer => ({
  id: i.id,
  firstName: s(i.first_name),
  lastName: s(i.last_name),
  middleName: i.middle_name || undefined,
  pinfl: s(i.pinfl),
  inn: s(i.inn),
  region: s(i.region),
  district: s(i.district),
  street: i.street || undefined,
  address: s(i.address),
});

const toAgent = (i: any): SalesAgent => ({
  id: i.id,
  firstName: s(i.first_name),
  lastName: s(i.last_name),
  middleName: i.middle_name || undefined,
  pinfl: s(i.pinfl),
  phone: s(i.phone),
  commissionRate: Number(i.commission_pct || 0),
  activeOrders: 0,
});

const toDriver = (i: any): Driver => ({
  id: i.id,
  firstName: s(i.first_name),
  lastName: s(i.last_name),
  middleName: i.middle_name || undefined,
  pinfl: s(i.pinfl),
  phone: s(i.phone),
  carPlate: s(i.car_number),
});

const toStore = (i: any): Store => ({
  id: i.id,
  storeName: s(i.shop_name),
  ownerFirstName: s(i.owner_first),
  ownerLastName: s(i.owner_last),
  pinfl: s(i.pinfl),
  inn: s(i.inn),
  phone: s(i.phone),
  category: i.category === "retail" ? "Retail" : i.category === "vip" ? "VIP" : "Diler",
  region: s(i.region),
  district: s(i.district),
  address: s(i.address),
  geoLocation: i.geo_lat && i.geo_lng ? `${i.geo_lat}, ${i.geo_lng}` : undefined,
});

export async function getDealers() {
  const { data } = await httpClient.get<BackendResponse<any[]>>("/dealers");
  return (data.data || []).map(toDealer);
}
export async function createDealer(payload: Partial<Dealer>) { return httpClient.post("/dealers", { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, inn: payload.inn || null, region: payload.region || null, district: payload.district || null, street: payload.street || null, address: payload.address || null }); }
export async function updateDealer(id: number, payload: Partial<Dealer>) { return httpClient.put(`/dealers/${id}`, { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, inn: payload.inn || null, region: payload.region || null, district: payload.district || null, street: payload.street || null, address: payload.address || null }); }
export async function deleteDealer(id: number) { return httpClient.delete(`/dealers/${id}`); }

export async function getShops() {
  const { data } = await httpClient.get<BackendResponse<any[]>>(
    "/shops",
  );
  return (data.data || []).map(toStore);
}
export async function createShop(payload: Partial<Store>) { return httpClient.post("/shops", { shop_name: payload.storeName, owner_first: payload.ownerFirstName, owner_last: payload.ownerLastName, pinfl: payload.pinfl || null, inn: payload.inn || null, phone: payload.phone, category: payload.category === "Retail" ? "retail" : payload.category === "VIP" ? "vip" : "dealer", region: payload.region || null, district: payload.district || null, address: payload.address || null }); }
export async function updateShop(id: number, payload: Partial<Store>) { return httpClient.put(`/shops/${id}`, { shop_name: payload.storeName, owner_first: payload.ownerFirstName, owner_last: payload.ownerLastName, pinfl: payload.pinfl || null, inn: payload.inn || null, phone: payload.phone, category: payload.category === "Retail" ? "retail" : payload.category === "VIP" ? "vip" : "dealer", region: payload.region || null, district: payload.district || null, address: payload.address || null }); }
export async function deleteShop(id: number) { return httpClient.delete(`/shops/${id}`); }

export async function getAgents() {
  const { data } = await httpClient.get<BackendResponse<any[]>>("/agents");
  return (data.data || []).map(toAgent);
}
export async function createAgent(payload: Partial<SalesAgent>) { return httpClient.post("/agents", { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, phone: payload.phone, commission_pct: payload.commissionRate || 0 }); }
export async function updateAgent(id: number, payload: Partial<SalesAgent>) { return httpClient.put(`/agents/${id}`, { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, phone: payload.phone, commission_pct: payload.commissionRate || 0 }); }
export async function deleteAgent(id: number) { return httpClient.delete(`/agents/${id}`); }

export async function getDrivers() {
  const { data } = await httpClient.get<BackendResponse<any[]>>("/drivers");
  return (data.data || []).map(toDriver);
}
export async function createDriver(payload: Partial<Driver>) { return httpClient.post("/drivers", { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, phone: payload.phone, car_number: payload.carPlate }); }
export async function updateDriver(id: number, payload: Partial<Driver>) { return httpClient.put(`/drivers/${id}`, { first_name: payload.firstName, last_name: payload.lastName, middle_name: payload.middleName || null, pinfl: payload.pinfl || null, phone: payload.phone, car_number: payload.carPlate }); }
export async function deleteDriver(id: number) { return httpClient.delete(`/drivers/${id}`); }
