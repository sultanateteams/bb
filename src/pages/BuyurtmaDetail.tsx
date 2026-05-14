import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/Badges";
import { formatNumber } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import { PaymentDialog } from "@/components/buyurtma/PaymentDialog";
import { useOrderByIDQuery } from "@/hooks/api/orders.hooks";

export default function BuyurtmaDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const orderId = Number(id);
  const [payOpen, setPayOpen] = useState(false);

  const { data: order, isLoading, isError } = useOrderByIDQuery(orderId);

  const remain = useMemo(() => {
    if (!order) return 0;
    return order.debt_amount;
  }, [order]);

  if (!id || Number.isNaN(orderId)) {
    return (
      <div className="space-y-4">
        <Link to="/buyurtma" className="text-sm text-primary hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Orqaga</Link>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Noto'g'ri buyurtma ID</div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Yuklanmoqda...</div>;
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Link to="/buyurtma" className="text-sm text-primary hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Orqaga</Link>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Buyurtma topilmadi</div>
      </div>
    );
  }

  const tone = order.status === "To'langan" ? "success" : order.status === "Qisman to'langan" ? "warning" : "danger";
  const methodLabel: Record<string, string> = { cash: "Naqt", terminal: "Terminal", transfer: "O'tkazma" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => nav("/buyurtma")}>
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Buyurtma {order.order_number}</h2>
            <p className="text-sm text-muted-foreground">{order.order_date}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} tone={tone} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Buyurtmachi</div>
            <div className="font-medium">{order.shop_name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Savdo vakili</div>
            <div className="font-medium">{order.agent_name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hudud</div>
            <div className="font-medium">{order.region}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold">Buyurtma tarkibi</div>
        <table className="data-table">
          <thead><tr><th>Nomi</th><th>Miqdori</th><th className="text-right">Narxi</th><th className="text-right">Jami</th></tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="font-medium">{i.product_type_name}</td>
                <td className="tabular-nums">{i.quantity}</td>
                <td className="text-right tabular-nums">{formatNumber(i.unit_price)}</td>
                <td className="text-right tabular-nums font-semibold">{formatNumber(i.total_price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/40">
            <tr><td colSpan={3} className="text-right font-semibold">Umumiy summa:</td><td className="text-right tabular-nums font-bold">{formatNumber(order.total_amount)}</td></tr>
            <tr><td colSpan={3} className="text-right font-semibold">To'langan:</td><td className="text-right tabular-nums text-success">{formatNumber(order.paid_amount)}</td></tr>
            <tr><td colSpan={3} className="text-right font-semibold">Qoldiq:</td><td className={`text-right tabular-nums ${remain > 0 ? "text-destructive font-bold" : ""}`}>{remain > 0 ? formatNumber(remain) : "—"}</td></tr>
          </tfoot>
        </table>
      </div>

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
            {order.transactions.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-6">To'lovlar yo'q</td></tr>}
            {order.transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.payment_date}</td>
                <td className="text-right tabular-nums font-semibold text-success">+{formatNumber(t.amount)}</td>
                <td><span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-xs">{methodLabel[t.payment_method] ?? t.payment_method}</span></td>
                <td className="text-muted-foreground">{t.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} orderId={order.id} remain={remain} />
    </div>
  );
}
