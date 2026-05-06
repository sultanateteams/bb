import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BranchBadge, StatusBadge } from "@/components/Badges";
import {
  dashboardKpis, revenueSeries, branchShare, lowStockAlerts, recentOrders,
} from "@/lib/mockData";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CreditCard, X } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn, formatNumber } from "@/lib/utils";
import { useOmborStore } from "@/lib/omborStore";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const history = useOmborStore((s) => s.history);
  const suppliers = useOmborStore((s) => s.suppliers);
  const orders = useOmborStore((s) => s.orders);
  const [showOverdueBanner, setShowOverdueBanner] = useState(true);

  // Kreditorlik calculations
  const unpaidImports = history.filter((r) => r.qoldiq && r.qoldiq > 0 && r.tolov_holati !== "tolangan");
  const totalKreditorlik = unpaidImports.reduce((sum, r) => sum + (r.qoldiq || 0), 0);
  const uniqueKredSuppliers = new Set(unpaidImports.map((r) => r.tamirotchi_id).filter(Boolean)).size;

  // Overdue
  const overdueImports = unpaidImports.filter((r) => {
    if (!r.tolov_muddati) return false;
    const parts = r.tolov_muddati.split(".");
    if (parts.length !== 3) return false;
    const deadline = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return deadline < new Date();
  });
  const overdueSum = overdueImports.reduce((s, r) => s + (r.qoldiq || 0), 0);

  // Top 5 kreditorlik
  const top5Kred = [...unpaidImports].sort((a, b) => (b.qoldiq || 0) - (a.qoldiq || 0)).slice(0, 5);

  // Top 5 debitorlik (unpaid orders)
  const unpaidOrders = orders.filter((o) => o.status !== "To'langan");
  const top5Debit = [...unpaidOrders].sort((a, b) => (b.total - b.paid) - (a.total - a.paid)).slice(0, 5);

  // Compute dynamic KPI cards
  const kpiCards = [
    ...dashboardKpis.slice(0, 3),
    {
      label: "Kreditorlik",
      value: formatNumber(totalKreditorlik),
      unit: "so'm",
      delta: `${uniqueKredSuppliers} ta`,
      positive: false,
      clickUrl: "/kreditorlik",
    },
    ...dashboardKpis.slice(3),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Biznesning real-time ko'rinishi" showExport />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
        {kpiCards.map((k: any) => (
          <div
            key={k.label}
            className={cn("stat-card", k.clickUrl && "cursor-pointer hover:ring-1 hover:ring-primary/30")}
            onClick={() => k.clickUrl && navigate(k.clickUrl)}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              {k.label === "Kreditorlik" && <CreditCard className="h-3.5 w-3.5 text-orange-500" />}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn("text-xl font-semibold tracking-tight", k.label === "Kreditorlik" && "text-orange-600")}>{k.value}</span>
              <span className="text-[11px] text-muted-foreground">{k.unit}</span>
            </div>
            <div className={cn("mt-2 inline-flex items-center gap-1 text-[11px] font-medium",
              k.positive ? "text-success" : "text-destructive")}>
              {k.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Warning Banner */}
      {showOverdueBanner && overdueImports.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="text-sm font-medium text-amber-800">
                ⚠️ Muddati o'tgan kreditorlik: {overdueImports.length} ta to'lov | {formatNumber(overdueSum)} so'm
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900" onClick={() => navigate("/kreditorlik?filter=muddati_otgan")}>
              Kreditorlikni ko'rish →
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowOverdueBanner(false)}>
              <X className="h-4 w-4 text-amber-600" />
            </Button>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Kirim va Chiqim (hafta)</h3>
              <p className="text-xs text-muted-foreground">million so'm</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Kirim</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Chiqim</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="kirim" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="chiqim" stroke="hsl(var(--warning))" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-1">Yo'nalish ulushi</h3>
          <p className="text-xs text-muted-foreground mb-3">savdo hajmi bo'yicha</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={branchShare} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {branchShare.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {branchShare.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: b.color }} />
                  {b.name}
                </span>
                <span className="font-medium">{b.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + Recent orders + Kreditorlik Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-semibold">Kam qoldiq ogohlantirishlari</h3>
          </div>
          <div className="space-y-2">
            {lowStockAlerts.map((a) => {
              const pct = Math.round((a.qty / a.min) * 100);
              return (
                <div key={a.name} className="p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BranchBadge branch={a.branch} />
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.qty}/{a.min} {a.unit}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                    <div className={cn("h-full rounded-full", pct < 50 ? "bg-destructive" : "bg-warning")} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold">Debitorlik — Top 5 (Mijozlar)</h3>
            <a href="/buyurtma" className="text-xs text-primary hover:underline">Hammasi →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Do'kon</th><th>Agent</th><th>Summa</th><th>Holat</th><th>To'lov</th>
              </tr>
            </thead>
            <tbody>
              {top5Debit.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">✅ Mijozlarga qarzdorlik yo'q</td></tr>
              ) : (
                top5Debit.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.id}</td>
                    <td className="font-medium">{o.shop}</td>
                    <td className="text-muted-foreground">{o.agent}</td>
                    <td className="font-medium">{formatNumber(o.total)} so'm</td>
                    <td><StatusBadge status={o.status} tone={o.status === "To'langan" ? "success" : o.status === "Qisman to'langan" ? "warning" : "danger"} /></td>
                    <td className="text-red-600 font-medium">{formatNumber(o.total - o.paid)} so'm</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kreditorlik Top 5 */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-semibold">Kreditorlik — Top 5 (Ta'minotchilar)</h3>
          <button onClick={() => navigate("/kreditorlik")} className="text-xs text-primary hover:underline">Barchasini ko'rish →</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ta'minotchi</th>
              <th>Import turi</th>
              <th className="text-right">Jami summa</th>
              <th className="text-right">To'langan</th>
              <th className="text-right">Qoldiq</th>
              <th>Muddati</th>
            </tr>
          </thead>
          <tbody>
            {top5Kred.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">✅ Ta'minotchilarga qarzdorlik yo'q</td></tr>
            ) : (
              top5Kred.map((r) => {
                const supplier = suppliers.find((s) => s.id === r.tamirotchi_id);
                return (
                  <tr key={r.id}>
                    <td className="font-medium">{supplier?.nomi || "—"}</td>
                    <td>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {r.import_turi === "xomashiyo" ? "Xomashiyo" : r.import_turi === "tm" ? "TM" : "WL"}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{formatNumber(r.jami_summa || 0)} so'm</td>
                    <td className="text-right tabular-nums text-green-600">{formatNumber(r.tolangan_summa || 0)} so'm</td>
                    <td className="text-right tabular-nums font-semibold text-red-600">{formatNumber(r.qoldiq || 0)} so'm</td>
                    <td>{r.tolov_muddati || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
