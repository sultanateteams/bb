// Yengil reactive store (backendsiz). useSyncExternalStore bilan ishlatiladi.
import { useSyncExternalStore } from "react";
import {
  products as seedProducts,
  rawMaterials as seedRaw,
  expenses as seedExpenses,
  incomes as seedIncomes,
  wlOps as seedWlOps,
  rawImportHistory as seedHistory,
  ichBatches as seedBatches,
  ichRawStockSeed,
  astatkaSeed,
  ichExtraRawMaterials,
  bom,
  type Product,
  type RawMaterial,
  type WlOp,
  type RawImportRecord,
  type IchBatch,
  type IchRawStock,
  type AstatkaItem,
  type Branch,
} from "./mockData";
import { formatNumber, parseNumber, todayUz } from "./utils";

interface ExpenseRow {
  id: number;
  date: string;
  type: string;
  note: string;
  amount: string;
  user: string;
}

interface IncomeRow {
  id: number;
  date: string;
  source: string;
  note: string;
  amount: string;
  method: string;
}

interface State {
  products: Product[];
  raw: RawMaterial[];
  wlOps: WlOp[];
  expenses: ExpenseRow[];
  incomes: IncomeRow[];
  history: RawImportRecord[];
  ichBatches: IchBatch[];
  ichRaw: IchRawStock[];
  astatka: AstatkaItem[];
}

let state: State = {
  products: seedProducts.map((p) => ({ ...p })),
  raw: [...seedRaw.map((r) => ({ ...r })), ...ichExtraRawMaterials.map((r) => ({ ...r }))],
  wlOps: seedWlOps.map((w) => ({ ...w })),
  expenses: seedExpenses.map((e) => ({ ...e })),
  incomes: seedIncomes.map((e) => ({ ...e })),
  history: seedHistory.map((h) => ({ ...h })),
  ichBatches: seedBatches.map((b) => ({ ...b })),
  ichRaw: ichRawStockSeed.map((r) => ({ ...r })),
  astatka: astatkaSeed.map((a) => ({ ...a })),
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
let nextIncomeId = Math.max(0, ...state.incomes.map((e) => e.id)) + 1;
let nextHistoryId = Math.max(0, ...state.history.map((h) => h.id)) + 1;
let nextAstatkaId = Math.max(0, ...state.astatka.map((a) => a.id)) + 1;
let nextIchRawId = Math.max(0, ...state.ichRaw.map((r) => r.id)) + 1;
let nextBatchNum = 319;

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

function addIncome(source: string, note: string, amount: number, method = "Naqd") {
  state.incomes = [
    {
      id: nextIncomeId++,
      date: todayUz(),
      source,
      note,
      amount: formatNumber(amount),
      method,
    },
    ...state.incomes,
  ];
}

export interface TmAddItem {
  productId: number;
  qty: number;
  price: number;
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
  const oldPrice = parseNumber(mat.price);
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

// ============== ICH actions ==============

export function transferRawToIch(materialId: number, qty: number) {
  const mat = state.raw.find((r) => r.id === materialId);
  if (!mat || qty <= 0 || qty > mat.stock) return;
  state.raw = state.raw.map((r) =>
    r.id === materialId ? { ...r, stock: r.stock - qty } : r,
  );
  const existing = state.ichRaw.find((r) => r.materialId === materialId);
  if (existing) {
    state.ichRaw = state.ichRaw.map((r) =>
      r.materialId === materialId ? { ...r, stock: r.stock + qty } : r,
    );
  } else {
    state.ichRaw = [
      ...state.ichRaw,
      {
        id: nextIchRawId++,
        materialId,
        name: mat.name,
        unit: mat.unit,
        stock: qty,
        min: Math.max(50, Math.round(qty * 0.3)),
      },
    ];
  }
  emit();
}

export interface ProduceItem { productId: number; qty: number; }
export interface BomNeed { materialId: number; name: string; unit: string; need: number; }

export function calcBomNeeds(items: ProduceItem[]): BomNeed[] {
  const map = new Map<number, BomNeed>();
  items.forEach(({ productId, qty }) => {
    const lines = bom[productId];
    if (!lines || !qty) return;
    lines.forEach((l) => {
      const ex = map.get(l.materialId);
      const add = l.perUnit * qty;
      if (ex) ex.need += add;
      else map.set(l.materialId, { materialId: l.materialId, name: l.name, unit: l.unit, need: add });
    });
  });
  return Array.from(map.values());
}

export function produceIch(items: ProduceItem[], needsOverride: BomNeed[]) {
  // xomashiyolarni ICH ombordan ayirish
  state.ichRaw = state.ichRaw.map((r) => {
    const n = needsOverride.find((x) => x.materialId === r.materialId);
    return n ? { ...r, stock: Math.max(0, r.stock - n.need) } : r;
  });

  // mahsulot stock'ini oshirish + tannarx
  let totalCost = 0;
  const labels: string[] = [];
  state.products = state.products.map((p) => {
    const it = items.find((i) => i.productId === p.id);
    if (!it) return p;
    totalCost += it.qty * parseNumber(p.price);
    labels.push(`${p.name} — ${it.qty} ${p.unit}`);
    return { ...p, stock: p.stock + it.qty };
  });

  // partiya yozuvi
  const id = `P-${nextBatchNum++}`;
  state.ichBatches = [
    {
      id,
      date: todayUz(),
      products: labels.join("; "),
      cost: formatNumber(totalCost),
      scrap: "—",
      user: "Operator",
    },
    ...state.ichBatches,
  ];
  emit();
}

export function discardToMakulatura(ids: number[], price: number, note?: string) {
  const items = state.astatka.filter((a) => ids.includes(a.id) && a.status === "Omborida");
  if (!items.length) return;
  state.astatka = state.astatka.map((a) =>
    ids.includes(a.id) && a.status === "Omborida"
      ? { ...a, status: "Makulaturaga chiqarilgan" }
      : a,
  );
  const desc = items.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(", ");
  addIncome("Makulatura", note ? `${desc} — ${note}` : desc, price, "Naqd");
  emit();
}
