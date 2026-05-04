import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/Badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmborStore, setOrderStatus } from "@/lib/omborStore";
import { shops, agents, type OrderPayStatus } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";
import { ArrowLeft, Plus, Undo2 } from "lucide-react";
import { PaymentDialog } from "@/components/buyurtma/PaymentDialog";
import { ReturnDialog } from "@/components/buyurtma/ReturnDialog";

export default function BuyurtmaDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const order = useOmborStore((s) => s.orders.find((o) => o.id === id));
  const [payOpen, setPayOpen] = useState(false);
  const [retOpen, setRetOpen] = useState(false);

  if (!order) {
    return (
      <div className="space-y-4">
        <Link to="/buyurtma" className="text-sm text-primary hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Orqaga</Link>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Buyurtma topilmadi</div>
      </div>
    );
  }

  const shop = shops.find((s) => s.id === order.shopId);
  const agent = agents.find((a) => a.id === order.agentId);
  const remain = order.total - order.paid;
  const tone = order.status === "To'langan" ? "success" : order.status === "Qisman to'langan" ? "warning" : "danger";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => nav("/buyurtma")}>
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => setRetOpen(true)}>
          <Undo2 className="h-4 w-4" /> Qaytarish
        </Button>
      </div>

      {/* Section 1 */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Buyurtma {order.id}</h2>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} tone={tone} />
            <Select value={order.status} onValueChange={(v) => setOrderStatus(order.id, v as OrderPayStatus)}>
              <SelectTrigger className="w-[170px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="To'langan">To'langan</SelectItem>
                <SelectItem value="Qisman to'langan">Qisman to'langan</SelectItem>
                <SelectItem value="To'lanmagan">To'lanmagan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Buyurtmachi</div>
            <div className="font-medium">{order.shop}</div>
            <div className="text-muted-foreground">{shop?.region}</div>
            <div className="text-muted-foreground">{shop?.phone}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Savdo vakili</div>
            <div className="font-medium">{order.agent}</div>
            <div className="text-muted-foreground">{agent?.phone}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hudud</div>
            <div className="font-medium">{order.region}</div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold">Buyurtma tarkibi</div>
        <table className="data-table">
          <thead><tr><th>Nomi</th><th>Miqdori</th><th>O'lchov</th><th className="text-right">Narxi</th><th className="text-right">Jami</th></tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.productId}>
                <td className="font-medium">{i.name}{i.returned ? <span className="ml-2 text-xs text-warning">(qaytarilgan: {i.returned})</span> : null}</td>
                <td className="tabular-nums">{i.qty}</td><td>{i.unit}</td>
                <td className="text-right tabular-nums">{formatNumber(i.price)}</td>
                <td className="text-right tabular-nums font-semibold">{formatNumber(i.qty * i.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/40">
            <tr><td colSpan={4} className="text-right font-semibold">Umumiy summa:</td><td className="text-right tabular-nums font-bold">{formatNumber(order.total)}</td></tr>
            <tr><td colSpan={4} className="text-right font-semibold">To'langan:</td><td className="text-right tabular-nums text-success">{formatNumber(order.paid)}</td></tr>
            <tr><td colSpan={4} className="text-right font-semibold">Qoldiq:</td><td className={`text-right tabular-nums ${remain > 0 ? "text-destructive font-bold" : ""}`}>{remain > 0 ? formatNumber(remain) : "—"}</td></tr>
          </tfoot>
        </table>
      </div>

      {/* Section 3 */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">To'lov tafsilotlari</div>
          <Button size="sm" className="gap-1" onClick={() => setPayOpen(true)} disabled={remain <= 0}>
            <Plus className="h-4 w-4" /> To'lov qo'shish
          </Button>
        </div>
        <table className="data-table">
          <thead><tr><th>Sana</th><th className="text-right">Summa</th><th>Usuli</th><th>Kim qabul qildi</th></tr></thead>
          <tbody>
            {order.payments.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-6">To'lovlar yo'q</td></tr>}
            {order.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td className="text-right tabular-nums font-semibold text-success">+{formatNumber(p.amount)}</td>
                <td><span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-xs">{p.method}</span></td>
                <td>{p.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.returns.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b font-semibold">Qaytarishlar</div>
          <table className="data-table">
            <thead><tr><th>Sana</th><th>Mahsulot</th><th>Miqdor</th><th>Sabab</th><th>Izoh</th></tr></thead>
            <tbody>
              {order.returns.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td><td>{r.name}</td><td className="tabular-nums">{r.qty}</td>
                  <td>{r.reason}</td><td className="text-muted-foreground">{r.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} orderId={order.id} remain={remain} />
      <ReturnDialog open={retOpen} onOpenChange={setRetOpen} order={order} />
    </div>
  );
}
