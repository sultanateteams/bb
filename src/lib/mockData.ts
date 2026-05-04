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
  { id: 1, date: "28.04.2026", type: "Xomashiyo (ICH)", note: "Sellyuloza import 500kg", amount: "4 100 000", user: "Admin" },
  { id: 2, date: "28.04.2026", type: "WL xizmat haqi", note: "Gel 1000gr — 200 dona", amount: "2 800 000", user: "Operator" },
  { id: 3, date: "27.04.2026", type: "Maosh", note: "Aprel 2-yarmi", amount: "32 500 000", user: "Admin" },
  { id: 4, date: "27.04.2026", type: "Yoqilg'i", note: "Yetkazib berish", amount: "1 240 000", user: "Operator" },
  { id: 5, date: "26.04.2026", type: "Ijara", note: "Asosiy ombor", amount: "8 000 000", user: "Admin" },
];

export const incomes = [
  { id: 1, date: "28.04.2026", source: "Olma Market", note: "Buyurtma B-2041 to'lovi", amount: "12 400 000", method: "Bank" },
  { id: 2, date: "28.04.2026", source: "Diyor Plus", note: "Buyurtma B-2039 to'lovi", amount: "21 100 000", method: "Naqd" },
  { id: 3, date: "27.04.2026", source: "Saodat Mart", note: "Qisman to'lov", amount: "10 000 000", method: "Bank" },
  { id: 4, date: "27.04.2026", source: "Astatka sotuv", note: "Makulatura 1.2t", amount: "1 800 000", method: "Naqd" },
];

export const ichBatches = [
  { id: "P-318", date: "28.04.2026", products: "Salfetka 365 (24) — 800 dona", cost: "5 240 000", scrap: "12 kg", user: "Operator" },
  { id: "P-317", date: "27.04.2026", products: "Tualet qog'ozi — 200 upak", cost: "3 880 000", scrap: "8 kg", user: "Operator" },
  { id: "P-316", date: "26.04.2026", products: "Salfetka mini — 1500 dona", cost: "2 100 000", scrap: "4 kg", user: "Admin" },
];

export const wlOps = [
  { id: "WL-104", date: "28.04.2026", product: "Gel 1000gr", qty: 200, factory: "Zavod-A", status: "Qabul kutilmoqda", cost: "8 400 000" },
  { id: "WL-103", date: "26.04.2026", product: "Suyuq sovun 500ml", qty: 350, factory: "Zavod-B", status: "Qabul qilindi", cost: "9 100 000" },
  { id: "WL-102", date: "24.04.2026", product: "Poroshok 900g", qty: 180, factory: "Zavod-A", status: "Qabul qilindi", cost: "6 240 000" },
];
