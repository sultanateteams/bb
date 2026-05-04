// Yengil reactive store (backendsiz). useSyncExternalStore bilan ishlatiladi.
import { useSyncExternalStore } from "react";
import {
  products as seedProducts,
  rawMaterials as seedRaw,
  expenses as seedExpenses,
  wlOps as seedWlOps,
  rawImportHistory as seedHistory,
  type Product,
  type RawMaterial,
  type WlOp,
  type RawImportRecord,
  type Branch,
} from "./mockData";
import { formatNumber, todayUz } from "./utils";

interface ExpenseRow {
  id: number;
  date: string;
  type: string;
  note: string;
  amount: string;
  user: string;
}

interface State {
  products: Product[];
  raw: RawMaterial[];
  wlOps: WlOp[];
  expenses: ExpenseRow[];
  history: RawImportRecord[];
}

let state: State = {
  products: seedProducts.map((p) => ({ ...p })),
  raw: seedRaw.map((r) => ({ ...r })),
  wlOps: seedWlOps.map((w) => ({ ...w })),
  expenses: seedExpenses.map((e) => ({ ...e })),
  history: seedHistory.map((h) => ({ ...h })),
};

const listeners = new Set<() => void>();
function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useOmborStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

let nextExpenseId = Math.max(0, ...state.expenses.map((e) => e.id)) + 1;
let nextHistoryId = Math.max(0, ...state.history.map((h) => h.id)) + 1;

function addExpense(type: string, note: string, amount: number) {
  state.expenses = [
    {
      id: nextExpenseId++,
      date: todayUz(),
      type,
      note,
      amount: formatNumber(amount),
      user: "Admin",
    },
    ...state.expenses,
  ];
}

export interface TmAddItem {
  productId: number;
  qty: number;
  price: number; // per unit
  note?: string;
}

export function addTmStock(items: TmAddItem[]) {
  let totalCost = 0;
  const names: string[] = [];
  state.products = state.products.map((p) => {
    const matches = items.filter((i) => i.productId === p.id);
    if (!matches.length) return p;
    const addedQty = matches.reduce((s, i) => s + i.qty, 0);
    matches.forEach((m) => {
      totalCost += m.qty * m.price;
      names.push(`${p.name} (${m.qty} ${p.unit})`);
    });
    return { ...p, stock: p.stock + addedQty };
  });
  if (totalCost > 0) {
    addExpense("TM xarid", names.join(", "), totalCost);
  }
  emit();
}

export function receiveWlBatch(opId: string, receivedQty: number, pricePerUnit: number) {
  const op = state.wlOps.find((o) => o.id === opId);
  if (!op) return;
  state.wlOps = state.wlOps.map((o) =>
    o.id === opId ? { ...o, status: "Ishlab chiqarilgan" } : o,
  );
  state.products = state.products.map((p) =>
    p.id === op.productId ? { ...p, stock: p.stock + receivedQty } : p,
  );
  const total = receivedQty * pricePerUnit;
  addExpense("WL qabul", `${op.id} — ${op.product}: ${receivedQty} dona`, total);
  emit();
}

export interface RawImportInput {
  materialId: number;
  qty: number;
  price: number;
  note?: string;
}

export function importRaw(input: RawImportInput) {
  const mat = state.raw.find((r) => r.id === input.materialId);
  if (!mat) return;
  const oldStock = mat.stock;
  const oldPrice = Number(mat.price.replace(/\s/g, "")) || 0;
  const newStock = oldStock + input.qty;
  const avgPrice =
    newStock > 0 ? (oldStock * oldPrice + input.qty * input.price) / newStock : input.price;

  state.raw = state.raw.map((r) =>
    r.id === input.materialId
      ? { ...r, stock: newStock, price: formatNumber(avgPrice) }
      : r,
  );

  const total = input.qty * input.price;
  state.history = [
    {
      id: nextHistoryId++,
      materialId: mat.id,
      name: mat.name,
      branch: mat.branch as Branch,
      qty: input.qty,
      unit: mat.unit,
      price: formatNumber(input.price),
      total: formatNumber(total),
      note: input.note ?? "",
      date: todayUz(),
    },
    ...state.history,
  ];
  addExpense(
    `Xomashiyo (${mat.branch.toUpperCase()})`,
    `${mat.name} — ${input.qty} ${mat.unit}`,
    total,
  );
  emit();
}
