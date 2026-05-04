// Yengil reactive store (backendsiz). useSyncExternalStore bilan ishlatiladi.
import { useSyncExternalStore } from "react";
import {
  products as seedProducts,
  rawMaterials as seedRaw,
  expenses as seedExpenses,
  expenseTypes as seedExpenseTypes,
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
  ordersSeed,
  returnsRestockStock,
  type Order,
  type OrderItem,
  type OrderPayStatus,
  type OrderPayment,
  type OrderReturn,
} from "./mockData";
import { formatNumber, parseNumber, todayUz } from "./utils";

interface ExpenseRow {
  id: number;
  date: string;
  typeId: number;
  type: string;
  amount: string;
  description: string;
  createdBy: string;
}

interface ExpenseType {
  id: number;
  name: string;
  description?: string;
  isAutomatic: boolean;
}

interface IncomeRow {
  id: number;
  date: string;
  type: 'order_payment' | 'scrap' | 'other';
  orderId?: string;
  amount: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  receivedBy: string;
  note?: string;
}

interface State {
  products: Product[];
  raw: RawMaterial[];
  wlOps: WlOp[];
  expenses: ExpenseRow[];
  expenseTypes: ExpenseType[];
  incomes: IncomeRow[];
  history: RawImportRecord[];
  ichBatches: IchBatch[];
  ichRaw: IchRawStock[];
  astatka: AstatkaItem[];
  orders: Order[];
}

let state: State = {
  products: seedProducts.map((p) => ({ ...p })),
  raw: [...seedRaw.map((r) => ({ ...r })), ...ichExtraRawMaterials.map((r) => ({ ...r }))],
  wlOps: seedWlOps.map((w) => ({ ...w })),
  expenses: seedExpenses.map((e) => ({ ...e })),
  expenseTypes: seedExpenseTypes.map((t) => ({ ...t })),
  incomes: seedIncomes.map((e) => ({ ...e })),
  history: seedHistory.map((h) => ({ ...h })),
  ichBatches: seedBatches.map((b) => ({ ...b })),
  ichRaw: ichRawStockSeed.map((r) => ({ ...r })),
  astatka: astatkaSeed.map((a) => ({ ...a })),
  orders: ordersSeed.map((o) => ({ ...o, items: o.items.map(i => ({ ...i })), payments: [...o.payments], returns: [...o.returns] })),
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
let nextExpenseTypeId = Math.max(0, ...state.expenseTypes.map((t) => t.id)) + 1;
let nextHistoryId = Math.max(0, ...state.history.map((h) => h.id)) + 1;
let nextAstatkaId = Math.max(0, ...state.astatka.map((a) => a.id)) + 1;
let nextIchRawId = Math.max(0, ...state.ichRaw.map((r) => r.id)) + 1;
let nextBatchNum = 319;

function addExpense(typeId: number, type: string, description: string, amount: number) {
  state.expenses = [
    {
      id: nextExpenseId++,
      date: todayUz(),
      typeId,
      type,
      description,
      amount: formatNumber(amount),
      createdBy: "Admin",
    },
    ...state.expenses,
  ];
}

function addIncome(type: 'order_payment' | 'scrap' | 'other', amount: number, paymentMethod: 'cash' | 'card' | 'transfer' = 'cash', receivedBy: string = 'Admin', orderId?: string, note?: string) {
  state.incomes = [
    {
      id: nextIncomeId++,
      date: todayUz(),
      type,
      orderId,
      amount: formatNumber(amount),
      paymentMethod,
      receivedBy,
      note,
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

// ============== Buyurtma actions ==============

function calcStatus(total: number, paid: number): OrderPayStatus {
  if (paid <= 0) return "To'lanmagan";
  if (paid >= total) return "To'langan";
  return "Qisman to'langan";
}

export function nextOrderId(): string {
  const nums = state.orders
    .map((o) => Number(o.id.replace(/[^\d]/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 2040) + 1;
  return `B-${next}`;
}

export interface CreateOrderInput {
  id: string;
  date: string;
  shopId: number;
  shop: string;
  region: string;
  agentId: number;
  agent: string;
  items: OrderItem[];
  paid: number;
  method: string;
}

export function createOrder(input: CreateOrderInput) {
  const total = input.items.reduce((s, i) => s + i.qty * i.price, 0);
  const status = calcStatus(total, input.paid);
  const payments: OrderPayment[] = input.paid > 0
    ? [{ id: 1, date: input.date, amount: input.paid, method: input.method, user: "Admin" }]
    : [];
  const order: Order = {
    id: input.id, date: input.date, shopId: input.shopId, shop: input.shop, region: input.region,
    agentId: input.agentId, agent: input.agent, items: input.items, total, paid: input.paid,
    status, payments, returns: [],
  };
  state.orders = [order, ...state.orders];
  // ombordan ayirish
  state.products = state.products.map((p) => {
    const it = input.items.find((i) => i.productId === p.id);
    return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
  });
  if (input.paid > 0) {
    addIncome(input.shop, `Buyurtma ${input.id} to'lovi`, input.paid, input.method);
  }
  emit();
  return order;
}

export function addOrderPayment(orderId: string, amount: number, method: string) {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o) return;
  const remain = o.total - o.paid;
  const amt = Math.min(amount, remain);
  if (amt <= 0) return;
  const newPaid = o.paid + amt;
  const pay: OrderPayment = {
    id: (o.payments.at(-1)?.id ?? 0) + 1,
    date: todayUz(), amount: amt, method, user: "Admin",
  };
  state.orders = state.orders.map((x) =>
    x.id === orderId
      ? { ...x, paid: newPaid, status: calcStatus(x.total, newPaid), payments: [...x.payments, pay] }
      : x,
  );
  addIncome(o.shop, `Buyurtma ${o.id} to'lovi`, amt, method);
  emit();
}

export function setOrderStatus(orderId: string, status: OrderPayStatus) {
  state.orders = state.orders.map((x) => (x.id === orderId ? { ...x, status } : x));
  emit();
}

export interface ReturnInput {
  orderId: string;
  productId: number;
  qty: number;
  reason: string;
  reasonLabel: string;
  note?: string;
}
export function addOrderReturn(input: ReturnInput) {
  const o = state.orders.find((x) => x.id === input.orderId);
  if (!o) return;
  const item = o.items.find((i) => i.productId === input.productId);
  if (!item) return;
  const ret: OrderReturn = {
    id: (o.returns.at(-1)?.id ?? 0) + 1,
    date: todayUz(),
    productId: input.productId,
    name: item.name,
    qty: input.qty,
    reason: input.reasonLabel,
    note: input.note,
  };
  state.orders = state.orders.map((x) =>
    x.id === input.orderId
      ? {
          ...x,
          returns: [...x.returns, ret],
          items: x.items.map((i) =>
            i.productId === input.productId ? { ...i, returned: (i.returned ?? 0) + input.qty } : i,
          ),
        }
      : x,
  );
  if (returnsRestockStock(input.reason)) {
    state.products = state.products.map((p) =>
      p.id === input.productId ? { ...p, stock: p.stock + input.qty } : p,
    );
  }
  emit();
}

// ============== Expense Types ==============

export function addExpenseType(name: string, description?: string): ExpenseType {
  const newType: ExpenseType = {
    id: nextExpenseTypeId++,
    name,
    description,
    isAutomatic: false,
  };
  state.expenseTypes = [...state.expenseTypes, newType];
  emit();
  return newType;
}

export function updateExpenseType(id: number, name: string, description?: string) {
  state.expenseTypes = state.expenseTypes.map((t) =>
    t.id === id && !t.isAutomatic ? { ...t, name, description } : t,
  );
  emit();
}

export function deleteExpenseType(id: number) {
  const type = state.expenseTypes.find((t) => t.id === id);
  if (!type || type.isAutomatic) return;
  state.expenseTypes = state.expenseTypes.filter((t) => t.id !== id);
  state.expenses = state.expenses.filter((e) => e.typeId !== id);
  emit();
}

// ============== Income Management ==============

export interface AddIncomeInput {
  type: 'order_payment' | 'scrap' | 'other';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  receivedBy: string;
  orderId?: string;
  note?: string;
  date?: string;
}

export function addNewIncome(input: AddIncomeInput) {
  state.incomes = [
    {
      id: nextIncomeId++,
      date: input.date || todayUz(),
      type: input.type,
      orderId: input.orderId,
      amount: formatNumber(input.amount),
      paymentMethod: input.paymentMethod,
      receivedBy: input.receivedBy,
      note: input.note,
    },
    ...state.incomes,
  ];
  emit();
}

// ============== Expense Management ==============

export interface AddExpenseInput {
  typeId: number;
  amount: number;
  description: string;
  createdBy: string;
  date?: string;
}

export function addNewExpense(input: AddExpenseInput) {
  const type = state.expenseTypes.find((t) => t.id === input.typeId);
  if (!type) return;
  state.expenses = [
    {
      id: nextExpenseId++,
      date: input.date || todayUz(),
      typeId: input.typeId,
      type: type.name,
      description: input.description,
      amount: formatNumber(input.amount),
      createdBy: input.createdBy,
    },
    ...state.expenses,
  ];
  emit();
}
