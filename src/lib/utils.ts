import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 9500 -> "9 500" */
export function formatNumber(n: number | string): string {
  const num = typeof n === "string" ? Number(n.replace(/\s/g, "")) : n;
  if (!Number.isFinite(num)) return String(n ?? "");
  return Math.round(num).toLocaleString("ru-RU").split(",").join(" ");
}

/** "9 500" -> 9500 */
export function parseNumber(s: string | number): number {
  if (typeof s === "number") return s;
  return Number((s ?? "").toString().replace(/\s/g, "")) || 0;
}

export function todayUz(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
