// Markaziy mock ma'lumotlar — barcha sahifalar shu yerdan ishlaydi.
// Backend qo'shilganda almashtiriladi.

export type Branch = "ich" | "wl" | "tm";
export type ShopCategory = "retail" | "dealer" | "vip";

export const branchLabel: Record<Branch, string> = {
  ich: "ICH",
  wl: "WL",
  tm: "TM",
};

export const branchFullLabel: Record<Branch, string> = {
  ich: "Ishlab chiqarish",
  wl: "White Label",
  tm: "Tayyor Mahsulot",
};

export const dashboardKpis = [
  { label: "Bugungi tushum", value: "48 720 000", unit: "so'm", delta: "+12.4%", positive: true },
  { label: "Bugungi chiqim", value: "21 350 000", unit: "so'm", delta: "+3.1%", positive: false },
  { label: "Sof foyda (oy)", value: "612 480 000", unit: "so'm", delta: "+18.7%", positive: true },
  { label: "Qarzdorlik", value: "184 200 000", unit: "so'm", delta: "-4.2%", positive: true },
  { label: "Buyurtmalar (bugun)", value: "37", unit: "ta", delta: "+5", positive: true },
  { label: "USD kursi", value: "12 650", unit: "so'm", delta: "0.0%", positive: true },
];

export const revenueSeries = [
  { day: "Du", kirim: 32, chiqim: 18 },
  { day: "Se", kirim: 41, chiqim: 22 },
  { day: "Ch", kirim: 38, chiqim: 19 },
  { day: "Pa", kirim: 52, chiqim: 26 },
  { day: "Ju", kirim: 47, chiqim: 21 },
  { day: "Sh", kirim: 61, chiqim: 28 },
  { day: "Ya", kirim: 49, chiqim: 24 },
];

export const branchShare = [
  { name: "ICH", value: 48, color: "hsl(var(--branch-ich))" },
  { name: "WL", value: 32, color: "hsl(var(--branch-wl))" },
  { name: "TM", value: 20, color: "hsl(var(--branch-tm))" },
];

export const lowStockAlerts = [
  { name: "Sellyuloza 365kun", qty: 124, min: 200, unit: "kg", branch: "ich" as Branch },
  { name: "Etiketka A4", qty: 1820, min: 3000, unit: "dona", branch: "ich" as Branch },
  { name: "Korobka 1000gr", qty: 340, min: 500, unit: "dona", branch: "wl" as Branch },
  { name: "Pampers Premium L", qty: 12, min: 50, unit: "upak", branch: "tm" as Branch },
];

export const recentOrders = [
  { id: "B-2041", shop: "Olma Market", agent: "B. Karimov", total: "12 400 000", status: "Tayyor", paid: true },
  { id: "B-2040", shop: "Hilola Savdo", agent: "S. Yusupov", total: "8 750 000", status: "Yo'lda", paid: false },
  { id: "B-2039", shop: "Diyor Plus", agent: "B. Karimov", total: "21 100 000", status: "Yetkazildi", paid: true },
  { id: "B-2038", shop: "Anvar Do'kon", agent: "M. Tursunov", total: "4 320 000", status: "Yangi", paid: false },
  { id: "B-2037", shop: "Saodat Mart", agent: "S. Yusupov", total: "15 600 000", status: "Tayyor", paid: true },
];

export type ProductStatus = "bo'sh" | "band";

export interface Product {
  id: number;
  name: string;
  branch: Branch;
  unit: string;
  stock: number;
  min: number;
  price: string;
  status: ProductStatus;
}

export const products: Product[] = [
  { id: 1, name: "Salfetka 365 (24)", branch: "ich", unit: "dona", stock: 1240, min: 500, price: "9 500", status: "bo'sh" },
  { id: 2, name: "Tualet qog'ozi 12-li", branch: "ich", unit: "upak", stock: 380, min: 200, price: "22 000", status: "band" },
  { id: 3, name: "Salfetka mini", branch: "ich", unit: "dona", stock: 4820, min: 1000, price: "3 200", status: "bo'sh" },
  { id: 4, name: "Gel 1000gr", branch: "wl", unit: "dona", stock: 612, min: 300, price: "31 500", status: "bo'sh" },
  { id: 5, name: "Suyuq sovun 500ml", branch: "wl", unit: "dona", stock: 980, min: 400, price: "18 700", status: "band" },
  { id: 6, name: "Poroshok 900g", branch: "wl", unit: "dona", stock: 240, min: 300, price: "27 800", status: "bo'sh" },
  { id: 7, name: "Pampers Premium L", branch: "tm", unit: "upak", stock: 12, min: 50, price: "138 000", status: "bo'sh" },
  { id: 8, name: "Salfetka import 30-li", branch: "tm", unit: "upak", stock: 88, min: 60, price: "42 000", status: "bo'sh" },
];

export interface RawMaterial {
  id: number;
  name: string;
  branch: Branch;
  unit: string;
  stock: number;
  min: number;
  price: string;
}

export const rawMaterials: RawMaterial[] = [
  { id: 1, name: "Sellyuloza 365kun", branch: "ich", unit: "kg", stock: 124, min: 200, price: "8 200" },
  { id: 2, name: "Etiketka A4", branch: "ich", unit: "dona", stock: 1820, min: 3000, price: "180" },
  { id: 3, name: "Klej PVA", branch: "ich", unit: "litre", stock: 84, min: 50, price: "14 500" },
  { id: 4, name: "Korobka 1000gr", branch: "wl", unit: "dona", stock: 340, min: 500, price: "1 200" },
  { id: 5, name: "Selofan rulon", branch: "wl", unit: "kg", stock: 220, min: 100, price: "9 800" },
  { id: 6, name: "Etiketka WL", branch: "wl", unit: "dona", stock: 5400, min: 2000, price: "320" },
];

export const shops = [
  { id: 1, name: "Olma Market", owner: "Karimov A.", category: "retail" as ShopCategory, region: "Toshkent", phone: "+998 90 123 45 67", debt: "0" },
  { id: 2, name: "Hilola Savdo", owner: "Yusupova H.", category: "dealer" as ShopCategory, region: "Samarqand", phone: "+998 91 234 56 78", debt: "8 750 000" },
  { id: 3, name: "Diyor Plus", owner: "Tursunov D.", category: "vip" as ShopCategory, region: "Buxoro", phone: "+998 93 345 67 89", debt: "0" },
  { id: 4, name: "Anvar Do'kon", owner: "Anvarov B.", category: "retail" as ShopCategory, region: "Andijon", phone: "+998 94 456 78 90", debt: "4 320 000" },
  { id: 5, name: "Saodat Mart", owner: "Saidov S.", category: "dealer" as ShopCategory, region: "Farg'ona", phone: "+998 97 567 89 01", debt: "0" },
];

export const agents = [
  { id: 1, name: "B. Karimov", phone: "+998 90 111 22 33", commission: 3.5, orders: 124, total: "412 000 000", active: true },
  { id: 2, name: "S. Yusupov", phone: "+998 91 222 33 44", commission: 4.0, orders: 87, total: "298 500 000", active: true },
  { id: 3, name: "M. Tursunov", phone: "+998 93 333 44 55", commission: 3.0, orders: 56, total: "184 200 000", active: true },
  { id: 4, name: "A. Rahimov", phone: "+998 94 444 55 66", commission: 3.5, orders: 41, total: "127 600 000", active: false },
];

export const drivers = [
  { id: 1, name: "Sh. Olimov", phone: "+998 90 555 66 77", car: "01 A 123 BB", trips: 142, active: true },
  { id: 2, name: "F. Qosimov", phone: "+998 91 666 77 88", car: "01 B 456 CC", trips: 98, active: true },
  { id: 3, name: "T. Norqulov", phone: "+998 93 777 88 99", car: "10 K 789 DD", trips: 67, active: true },
];

export const dealers = [
  { id: 1, name: "Hilola Distribution", inn: "301234567", region: "Samarqand", phone: "+998 91 234 56 78", turnover: "1 240 000 000" },
  { id: 2, name: "Saodat Trade", inn: "302345678", region: "Farg'ona", phone: "+998 97 567 89 01", turnover: "890 600 000" },
  { id: 3, name: "Buxoro Mart Group", inn: "303456789", region: "Buxoro", phone: "+998 93 345 67 89", turnover: "1 580 200 000" },
];

export const expenses = [
  { id: 1, date: "28.04.2026", typeId: 1, type: "Xomashiyo (ICH)", description: "Sellyuloza import 500kg", amount: "4 100 000", createdBy: "Admin" },
  { id: 2, date: "28.04.2026", typeId: 3, type: "WL xizmat haqi", description: "Gel 1000gr — 200 dona", amount: "2 800 000", createdBy: "Operator" },
  { id: 3, date: "27.04.2026", typeId: 5, type: "Oyliklar", description: "Aprel 2-yarmi", amount: "32 500 000", createdBy: "Admin" },
  { id: 4, date: "27.04.2026", typeId: 8, type: "Transport yoqilg'i", description: "Yetkazib berish", amount: "1 240 000", createdBy: "Operator" },
  { id: 5, date: "26.04.2026", typeId: 12, type: "Boshqa", description: "Asosiy ombor ijara", amount: "8 000 000", createdBy: "Admin" },
];

export const expenseTypes = [
  { id: 1, name: "Xomashiyo (ICH)", description: "Avtomatik", isAutomatic: true },
  { id: 2, name: "Xomashiyo (WL)", description: "Avtomatik", isAutomatic: true },
  { id: 3, name: "WL xizmat haqi", description: "Avtomatik", isAutomatic: true },
  { id: 4, name: "TM kirim", description: "Avtomatik", isAutomatic: true },
  { id: 5, name: "Oyliklar", description: "", isAutomatic: false },
  { id: 6, name: "Premiya", description: "", isAutomatic: false },
  { id: 7, name: "Transport remont", description: "", isAutomatic: false },
  { id: 8, name: "Transport yoqilg'i", description: "", isAutomatic: false },
  { id: 9, name: "Agent oyligi", description: "", isAutomatic: false },
  { id: 10, name: "ICH texnik xarajat", description: "", isAutomatic: false },
  { id: 11, name: "WL texnik xarajat", description: "", isAutomatic: false },
  { id: 12, name: "Boshqa", description: "", isAutomatic: false },
  { id: 13, name: "Kreditorlik to'lovi", description: "", isAutomatic: false },
];

export const incomes = [
  { id: 1, date: "28.04.2026", type: "order_payment" as const, orderId: "B-2041", amount: "12 400 000", paymentMethod: "transfer" as const, receivedBy: "Admin", note: "Olma Market to'lovi" },
  { id: 2, date: "28.04.2026", type: "order_payment" as const, orderId: "B-2039", amount: "21 100 000", paymentMethod: "cash" as const, receivedBy: "Admin", note: "Diyor Plus to'lovi" },
  { id: 3, date: "27.04.2026", type: "order_payment" as const, orderId: "B-2040", amount: "10 000 000", paymentMethod: "transfer" as const, receivedBy: "Operator", note: "Qisman to'lov" },
  { id: 4, date: "27.04.2026", type: "scrap" as const, amount: "1 800 000", paymentMethod: "cash" as const, receivedBy: "Admin", note: "Makulatura 1.2t" },
];

export interface IchBatch {
  id: string;
  date: string;
  products: string;
  cost: string;
  scrap: string;
  user: string;
}

export const ichBatches: IchBatch[] = [
  { id: "P-318", date: "28.04.2026", products: "Salfetka 365 (24) — 800 dona", cost: "5 240 000", scrap: "12 kg", user: "Operator" },
  { id: "P-317", date: "27.04.2026", products: "Tualet qog'ozi — 200 upak", cost: "3 880 000", scrap: "8 kg", user: "Operator" },
  { id: "P-316", date: "26.04.2026", products: "Salfetka mini — 1500 dona", cost: "2 100 000", scrap: "4 kg", user: "Admin" },
];

// Korobka (kichik) — ICH xomashiyo katalogiga qo'shamiz (BOM uchun kerak)
export const ichExtraRawMaterials: RawMaterial[] = [
  { id: 7, name: "Korobka (kichik)", branch: "ich", unit: "dona", stock: 320, min: 200, price: "1 800" },
];

// ICH ichki xomashiyo ombori (asosiy ombordan o'tkazilgan)
export interface IchRawStock {
  id: number;
  materialId: number;
  name: string;
  unit: string;
  stock: number;
  min: number;
}

export const ichRawStockSeed: IchRawStock[] = [
  { id: 1, materialId: 1, name: "Sellyuloza", unit: "kg", stock: 450, min: 300 },
  { id: 2, materialId: 2, name: "Etiketka A4", unit: "dona", stock: 1200, min: 1000 },
  { id: 3, materialId: 3, name: "Klej PVA", unit: "litre", stock: 38, min: 50 },
  { id: 4, materialId: 7, name: "Korobka (kichik)", unit: "dona", stock: 95, min: 200 },
];

// BOM: productId -> materiallar va dona/birlik koeffisiyentlari
export interface BomLine { materialId: number; name: string; unit: string; perUnit: number; }
export const bom: Record<number, BomLine[]> = {
  1: [ // Salfetka 365 (24)
    { materialId: 1, name: "Sellyuloza", unit: "kg", perUnit: 0.01 },
    { materialId: 2, name: "Etiketka A4", unit: "dona", perUnit: 0.001 },
    { materialId: 3, name: "Klej PVA", unit: "litre", perUnit: 0.002 },
  ],
  2: [ // Tualet qog'ozi 12-li
    { materialId: 1, name: "Sellyuloza", unit: "kg", perUnit: 0.008 },
    { materialId: 7, name: "Korobka (kichik)", unit: "dona", perUnit: 1 },
  ],
  3: [ // Salfetka mini
    { materialId: 1, name: "Sellyuloza", unit: "kg", perUnit: 0.005 },
    { materialId: 2, name: "Etiketka A4", unit: "dona", perUnit: 0.0005 },
  ],
  4: [ // Gel 1000gr
    { materialId: 4, name: "Korobka 1000gr", unit: "dona", perUnit: 1 },
    { materialId: 6, name: "Etiketka WL", unit: "dona", perUnit: 1 },
    { materialId: 5, name: "Selofan rulon", unit: "kg", perUnit: 0.05 },
  ],
  5: [ // Suyuq sovun 500ml
    { materialId: 4, name: "Korobka 1000gr", unit: "dona", perUnit: 1 },
    { materialId: 6, name: "Etiketka WL", unit: "dona", perUnit: 1 },
    { materialId: 5, name: "Selofan rulon", unit: "kg", perUnit: 0.02 },
  ],
  6: [ // Poroshok 900g
    { materialId: 4, name: "Korobka 1000gr", unit: "dona", perUnit: 1 },
    { materialId: 6, name: "Etiketka WL", unit: "dona", perUnit: 1 },
    { materialId: 5, name: "Selofan rulon", unit: "kg", perUnit: 0.1 },
  ],
};

export type AstatkaStatus = "Omborida" | "Makulaturaga chiqarilgan";
export interface AstatkaItem {
  id: number;
  date: string;
  name: string;
  qty: number;
  unit: string;
  status: AstatkaStatus;
}

export const astatkaSeed: AstatkaItem[] = [
  { id: 1, date: "28.04.2026", name: "Sellyuloza qoldig'i", qty: 12, unit: "kg", status: "Omborida" },
  { id: 2, date: "27.04.2026", name: "Nuqsonli salfetka", qty: 45, unit: "dona", status: "Omborida" },
  { id: 3, date: "26.04.2026", name: "Korobka parcha", qty: 4, unit: "kg", status: "Makulaturaga chiqarilgan" },
  { id: 4, date: "25.04.2026", name: "Etiketka qoldig'i", qty: 200, unit: "dona", status: "Makulaturaga chiqarilgan" },
];

export type WlStatus = "Ishlab chiqarishdagi" | "Ishlab chiqarilgan";

export interface WlOp {
  id: string;
  date: string;
  product: string;
  productId: number;
  qty: number;
  factory: string;
  status: WlStatus;
  cost: string;
  receivedQuantity?: number;
  extraQuantity?: number;
  materials?: { name: string; quantity: number; unit: string; price: number; total: number }[];
  serviceCharge?: number;
}

export const wlOps: WlOp[] = [
  { id: "WL-104", date: "28.04.2026", product: "Gel 1000gr", productId: 4, qty: 200, factory: "Zavod-A", status: "Ishlab chiqarishdagi", cost: "8 400 000" },
  { id: "WL-105", date: "27.04.2026", product: "Poroshok 900g", productId: 6, qty: 150, factory: "Zavod-A", status: "Ishlab chiqarishdagi", cost: "5 200 000" },
  { id: "WL-103", date: "26.04.2026", product: "Suyuq sovun 500ml", productId: 5, qty: 350, factory: "Zavod-B", status: "Ishlab chiqarilgan", cost: "9 100 000", receivedQuantity: 360, extraQuantity: 10 },
  { id: "WL-102", date: "24.04.2026", product: "Poroshok 900g", productId: 6, qty: 180, factory: "Zavod-A", status: "Ishlab chiqarilgan", cost: "6 240 000", receivedQuantity: 180 },
];

export interface Supplier {
  id: string;
  nomi: string;
  telefon: string;
  manzil?: string;
  inn?: string;
  izoh?: string;
  createdAt: string;
}

export type PaymentMethod = "naqt" | "plastik" | "otkazma";
export type PaymentStatus = "tolangan" | "qisman" | "tolanmagan";

export interface PaymentRecord {
  id: string;
  sana: string;
  summa: number;
  usul: PaymentMethod;
  izoh?: string;
}

export interface RawImportRecord {
  id: number;
  materialId: number;
  name: string;
  branch: Branch; // ICH | WL
  qty: number;
  unit: string;
  price: string; // per unit
  total: string;
  note: string;
  date: string;
  // New payment tracking fields
  tamirotchi_id?: string;
  jami_summa?: number;
  tolangan_summa?: number;
  qoldiq?: number;
  tolov_holati?: PaymentStatus;
  tolov_usuli?: PaymentMethod;
  tolov_tarixi?: PaymentRecord[];
  tolov_muddati?: string;
  import_turi?: "xomashiyo" | "tm" | "wl";
}

export const regions = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan"];

export type OrderPayStatus = "To'langan" | "Qisman to'langan" | "To'lanmagan";
export interface OrderItem {
  productId: number;
  name: string;
  unit: string;
  qty: number;
  price: number; // dona narxi
  returned?: number;
}
export interface OrderPayment {
  id: number;
  date: string;
  amount: number;
  method: string;
  user: string;
}
export interface OrderReturn {
  id: number;
  date: string;
  productId: number;
  name: string;
  qty: number;
  reason: string;
  note?: string;
}
export interface Order {
  id: string;
  date: string;
  shopId: number;
  shop: string;
  region: string;
  agentId: number;
  agent: string;
  items: OrderItem[];
  total: number;
  paid: number;
  status: OrderPayStatus;
  payments: OrderPayment[];
  returns: OrderReturn[];
}

export const ordersSeed: Order[] = [
  {
    id: "B-2041", date: "28.04.2026", shopId: 1, shop: "Olma Market", region: "Toshkent",
    agentId: 1, agent: "B. Karimov",
    items: [{ productId: 1, name: "Salfetka 365 (24)", unit: "dona", qty: 800, price: 9500 }, { productId: 2, name: "Tualet qog'ozi 12-li", unit: "upak", qty: 220, price: 22000 }],
    total: 12_400_000, paid: 12_400_000, status: "To'langan",
    payments: [{ id: 1, date: "28.04.2026", amount: 12_400_000, method: "Bank", user: "Admin" }], returns: [],
  },
  {
    id: "B-2040", date: "28.04.2026", shopId: 2, shop: "Hilola Savdo", region: "Samarqand",
    agentId: 2, agent: "S. Yusupov",
    items: [{ productId: 4, name: "Gel 1000gr", unit: "dona", qty: 200, price: 31500 }, { productId: 5, name: "Suyuq sovun 500ml", unit: "dona", qty: 130, price: 18700 }],
    total: 8_750_000, paid: 0, status: "To'lanmagan", payments: [], returns: [],
  },
  {
    id: "B-2039", date: "27.04.2026", shopId: 3, shop: "Diyor Plus", region: "Buxoro",
    agentId: 1, agent: "B. Karimov",
    items: [{ productId: 7, name: "Pampers Premium L", unit: "upak", qty: 120, price: 138000 }, { productId: 8, name: "Salfetka import 30-li", unit: "upak", qty: 110, price: 42000 }],
    total: 21_100_000, paid: 21_100_000, status: "To'langan",
    payments: [{ id: 1, date: "27.04.2026", amount: 21_100_000, method: "Naqd", user: "Admin" }], returns: [],
  },
  {
    id: "B-2042", date: "29.04.2026", shopId: 4, shop: "Anvar Do'kon", region: "Toshkent",
    agentId: 2, agent: "S. Yusupov",
    items: [{ productId: 3, name: "Salfetka mini", unit: "dona", qty: 2000, price: 3250 }],
    total: 6_500_000, paid: 0, status: "To'lanmagan", payments: [], returns: [],
  },
  {
    id: "B-2043", date: "29.04.2026", shopId: 2, shop: "Nargiza Savdo", region: "Samarqand",
    agentId: 1, agent: "B. Karimov",
    items: [{ productId: 4, name: "Gel 1000gr", unit: "dona", qty: 292, price: 31500 }],
    total: 9_200_000, paid: 4_000_000, status: "Qisman to'langan",
    payments: [{ id: 1, date: "29.04.2026", amount: 4_000_000, method: "Plastik", user: "Admin" }], returns: [],
  },
];

export const returnReasons = [
  { value: "rejected", label: "Mijoz rad etdi", info: "⚠️ Ombor qaytariladi. Agent foizi qayta hisoblanadi" },
  { value: "defective", label: "Tovar yaroqsiz (nuqson)", info: "ℹ️ Ombor qaytarilmaydi. Agent foizi saqlanadi" },
  { value: "transport", label: "Transport muammosi", info: "⚠️ Ombor qaytariladi. Agent foizi saqlanadi" },
  { value: "shortage", label: "Omborda yetishmaslik", info: "ℹ️ Qisman bajarildi deb belgilanadi" },
  { value: "expired", label: "Muddati o'tgan", info: "ℹ️ Ombor qaytarilmaydi" },
];

export function returnsRestockStock(reason: string): boolean {
  return reason === "rejected" || reason === "transport";
}

export const suppliers: Supplier[] = [
  {
    id: "sup-001",
    nomi: "Sherzod Trade",
    telefon: "+998 90 123 45 67",
    manzil: "Toshkent, Mirzo Ulugbek tumani",
    inn: "301234567",
    izoh: "Xomashiyo ta'minotchisi",
    createdAt: "25.04.2026",
  },
  {
    id: "sup-002",
    nomi: "Box-Pro MChJ",
    telefon: "+998 91 234 56 78",
    manzil: "Toshkent, Chilonzor tumani",
    inn: "302345678",
    izoh: "Korobka va qifolovchi masalalar",
    createdAt: "20.04.2026",
  },
  {
    id: "sup-003",
    nomi: "Print Center",
    telefon: "+998 93 345 67 89",
    manzil: "Samarqand, Samarqand tumani",
    inn: "303456789",
    createdAt: "15.04.2026",
  },
  {
    id: "sup-004",
    nomi: "Kimyo Sklad",
    telefon: "+998 94 456 78 90",
    manzil: "Buxoro",
    inn: "304567890",
    izoh: "Kimyoviy moddalar",
    createdAt: "10.04.2026",
  },
  {
    id: "sup-005",
    nomi: "Zavod-A",
    telefon: "+998 97 567 89 01",
    manzil: "Andijon, sanoat zona",
    izoh: "White Label ishlab chiqarish",
    createdAt: "01.04.2026",
  },
  {
    id: "sup-006",
    nomi: "Zavod-B",
    telefon: "+998 98 678 90 12",
    manzil: "Farg'ona, sanoat zona",
    izoh: "White Label ishlab chiqarish",
    createdAt: "01.04.2026",
  },
];

export const rawImportHistory: RawImportRecord[] = [
  {
    id: 1,
    materialId: 1,
    name: "Sellyuloza 365kun",
    branch: "ich",
    qty: 500,
    unit: "kg",
    price: "8 200",
    total: "4 100 000",
    note: "invoys #4421",
    date: "28.04.2026",
    tamirotchi_id: "sup-001",
    jami_summa: 4100000,
    tolangan_summa: 2000000,
    qoldiq: 2100000,
    tolov_holati: "qisman",
    tolov_usuli: "otkazma",
    tolov_tarixi: [{ id: "pay-1", sana: "28.04.2026", summa: 2000000, usul: "otkazma", izoh: "Qisman to'lov" }],
    tolov_muddati: "05.05.2026",
    import_turi: "xomashiyo",
  },
  {
    id: 2,
    materialId: 4,
    name: "Korobka 1000gr",
    branch: "wl",
    qty: 1000,
    unit: "dona",
    price: "1 200",
    total: "1 200 000",
    note: "",
    date: "26.04.2026",
    tamirotchi_id: "sup-002",
    jami_summa: 1200000,
    tolangan_summa: 1200000,
    qoldiq: 0,
    tolov_holati: "tolangan",
    tolov_usuli: "plastik",
    tolov_tarixi: [{ id: "pay-2", sana: "26.04.2026", summa: 1200000, usul: "plastik" }],
    import_turi: "xomashiyo",
  },
  {
    id: 3,
    materialId: 2,
    name: "Etiketka A4",
    branch: "ich",
    qty: 5000,
    unit: "dona",
    price: "180",
    total: "900 000",
    note: "",
    date: "22.04.2026",
    tamirotchi_id: "sup-003",
    jami_summa: 900000,
    tolangan_summa: 0,
    qoldiq: 900000,
    tolov_holati: "tolanmagan",
    tolov_tarixi: [],
    tolov_muddati: "29.04.2026",
    import_turi: "xomashiyo",
  },
  {
    id: 4,
    materialId: 5,
    name: "Selofan rulon",
    branch: "wl",
    qty: 80,
    unit: "kg",
    price: "9 800",
    total: "784 000",
    note: "",
    date: "18.04.2026",
    tamirotchi_id: "sup-002",
    jami_summa: 784000,
    tolangan_summa: 784000,
    qoldiq: 0,
    tolov_holati: "tolangan",
    tolov_usuli: "naqt",
    tolov_tarixi: [{ id: "pay-4", sana: "18.04.2026", summa: 784000, usul: "naqt" }],
    import_turi: "xomashiyo",
  },
  {
    id: 5,
    materialId: 3,
    name: "Klej PVA",
    branch: "ich",
    qty: 40,
    unit: "litre",
    price: "14 500",
    total: "580 000",
    note: "",
    date: "12.04.2026",
    tamirotchi_id: "sup-004",
    jami_summa: 580000,
    tolangan_summa: 580000,
    qoldiq: 0,
    tolov_holati: "tolangan",
    tolov_usuli: "otkazma",
    tolov_tarixi: [{ id: "pay-5", sana: "12.04.2026", summa: 580000, usul: "otkazma" }],
    import_turi: "xomashiyo",
  },
];
