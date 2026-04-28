import { PageHeader } from "@/components/PageHeader";
import { BranchBadge, StatusBadge } from "@/components/Badges";
import {
  dashboardKpis, revenueSeries, branchShare, lowStockAlerts, recentOrders,
} from "@/lib/mockData";
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Biznesning real-time ko'rinishi" showExport />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {dashboardKpis.map((k) => (
          <div key={k.label} className="stat-card">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">{k.value}</span>
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

      {/* Alerts + Recent orders */}
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
            <h3 className="font-semibold">So'nggi buyurtmalar</h3>
            <a href="/buyurtma" className="text-xs text-primary hover:underline">Hammasi →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Do'kon</th><th>Agent</th><th>Summa</th><th>Holat</th><th>To'lov</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id}</td>
                  <td className="font-medium">{o.shop}</td>
                  <td className="text-muted-foreground">{o.agent}</td>
                  <td className="font-medium">{o.total} so'm</td>
                  <td><StatusBadge status={o.status} tone={o.status === "Yetkazildi" ? "success" : o.status === "Yo'lda" ? "info" : o.status === "Yangi" ? "warning" : "default"} /></td>
                  <td>{o.paid ? <StatusBadge status="To'langan" tone="success" /> : <StatusBadge status="Qarzdor" tone="danger" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
