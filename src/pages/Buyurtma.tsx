import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/Badges";
import { agents, shops, regions } from "@/lib/mockData";
import { useOmborStore } from "@/lib/omborStore";
import { formatNumber, parseNumber } from "@/lib/utils";
import { NewOrderDialog } from "@/components/buyurtma/NewOrderDialog";
import { Plus, RotateCcw, Download } from "lucide-react";

const ALL = "__all__";

function toDate(s: string) {
  const [d, m, y] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

export default function Buyurtma() {
  const orders = useOmborStore((s) => s.orders);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [agent, setAgent] = useState(ALL);
  const [shop, setShop] = useState(ALL);
  const [region, setRegion] = useState(ALL);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (q) {
        const s = q.toLowerCase();
        if (!o.id.toLowerCase().includes(s) && !o.shop.toLowerCase().includes(s)) return false;
      }
      if (status !== ALL && o.status !== status) return false;
      if (agent !== ALL && String(o.agentId) !== agent) return false;
      if (shop !== ALL && String(o.shopId) !== shop) return false;
      if (region !== ALL && o.region !== region) return false;
      if (from) { if (toDate(o.date) < new Date(from)) return false; }
      if (to) { if (toDate(o.date) > new Date(to)) return false; }
      return true;
    });
  }, [orders, q, status, from, to, agent, shop, region]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (s, o) => ({ total: s.total + o.total, paid: s.paid + o.paid, remain: s.remain + (o.total - o.paid) }),
      { total: 0, paid: 0, remain: 0 },
    );
  }, [filtered]);

  function reset() {
    setQ(""); setStatus(ALL); setFrom(""); setTo(""); setAgent(ALL); setShop(ALL); setRegion(ALL);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Buyurtmalar" subtitle="Agentlar va do'konlardan kelgan buyurtmalar"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Eksport</Button>
            <Button size="sm" className="gap-2 bg-gradient-brand hover:opacity-90" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Yangi buyurtma
            </Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div><Label className="text-xs">Qidiruv</Label><Input placeholder="ID yoki do'kon..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div>
            <Label className="text-xs">Holati</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Hammasi</SelectItem>
                <SelectItem value="To'langan">To'langan</SelectItem>
                <SelectItem value="Qisman to'langan">Qisman to'langan</SelectItem>
                <SelectItem value="To'lanmagan">To'lanmagan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Sana (dan)</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><Label className="text-xs">Sana (gacha)</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div>
            <Label className="text-xs">Savdo vakili</Label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Hammasi</SelectItem>
                {agents.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Buyurtmachi</Label>
            <Select value={shop} onValueChange={setShop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Hammasi</SelectItem>
                {shops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Hudud</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Hammasi</SelectItem>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Tozalash
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Sana</th><th>Buyurtmachi</th><th>Savdo vakili</th>
              <th className="text-right">Summa</th><th className="text-right">To'langan</th><th className="text-right">Qoldiq</th>
              <th>Holati</th><th>Hudud</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center text-muted-foreground py-8">Buyurtma topilmadi</td></tr>}
            {filtered.map((o) => {
              const remain = o.total - o.paid;
              const tone = o.status === "To'langan" ? "success" : o.status === "Qisman to'langan" ? "warning" : "danger";
              return (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-semibold">{o.id}</td>
                  <td className="text-muted-foreground">{o.date}</td>
                  <td className="font-medium">{o.shop}</td>
                  <td>{o.agent}</td>
                  <td className="text-right tabular-nums font-semibold">{formatNumber(o.total)}</td>
                  <td className="text-right tabular-nums">{formatNumber(o.paid)}</td>
                  <td className={`text-right tabular-nums ${remain > 0 ? "text-destructive font-bold" : ""}`}>{remain > 0 ? formatNumber(remain) : "—"}</td>
                  <td><StatusBadge status={o.status} tone={tone} /></td>
                  <td>{o.region}</td>
                  <td className="text-right">
                    <Link to={`/buyurtma/${o.id}`} className="text-xs text-primary hover:underline">Ko'rish</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-muted/40 font-semibold">
              <tr>
                <td colSpan={4} className="text-right">Jami:</td>
                <td className="text-right tabular-nums">{formatNumber(totals.total)}</td>
                <td className="text-right tabular-nums text-success">{formatNumber(totals.paid)}</td>
                <td className="text-right tabular-nums text-destructive">{formatNumber(totals.remain)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <NewOrderDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
