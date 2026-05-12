import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmborStore, nextOrderId } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAgents, getShops } from "@/services/partners.service";
import { getProductTypes } from "@/services/product-types.service";
import { getPriceTiers } from "@/services/product-bom.service";
import { useCreateOrderMutation } from "@/hooks/api/orders.hooks";

type ShopCategory = "retail" | "dealer" | "vip";
const catLabel: Record<ShopCategory, string> = { retail: "Retail", dealer: "Diler", vip: "VIP" };

interface Row { productId: number; name: string; unit: string; qty: number; price: number; }

export function NewOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const productsStock = useOmborStore((s) => s.products);
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: getAgents });
  const { data: shops = [] } = useQuery({ queryKey: ["shops"], queryFn: getShops });
  const { data: productTypes = [] } = useQuery({ queryKey: ["product-types"], queryFn: getProductTypes });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [orderId, setOrderId] = useState(() => nextOrderId());
  const [agentId, setAgentId] = useState<string>("");
  const [shopId, setShopId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [paid, setPaid] = useState(0);
  const [method, setMethod] = useState("Naqt");

  const [pickProduct, setPickProduct] = useState<string>("");
  const [pickQty, setPickQty] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createOrderMutation = useCreateOrderMutation();

  const shop = shops.find((s) => s.id === Number(shopId));
  const agent = agents.find((a) => a.id === Number(agentId));
  const total = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const remain = Math.max(0, total - paid);
  const status = paid <= 0 ? "To'lanmagan" : paid >= total ? "To'langan" : "Qisman to'langan";

  const pickedProduct = productTypes.find((p) => p.id === pickProduct);
  const pickedStock = productsStock.find((p) => String(p.id) === pickProduct)?.stock ?? 0;
  const { data: pickedPriceTiers = [] } = useQuery({
    queryKey: ["price-tiers", pickProduct],
    queryFn: () => getPriceTiers(Number(pickProduct)),
    enabled: !!pickProduct,
  });
  const previewPrice = useMemo(() => {
    if (!pickedProduct || !shop || !pickQty) return 0;
    const cat: ShopCategory = shop.category === "Retail" ? "retail" : shop.category === "VIP" ? "vip" : "dealer";
    const tier = pickedPriceTiers.find((t) =>
      t.shop_category === cat &&
      pickQty >= t.qty_from &&
      (t.qty_to == null || pickQty <= t.qty_to),
    );
    return tier ? Number(tier.unit_price) : 0;
  }, [pickedProduct, shop, pickQty, pickedPriceTiers]);

  function reset() {
    setDate(new Date().toISOString().slice(0, 10));
    setOrderId(nextOrderId());
    setAgentId(""); setShopId(""); setRows([]); setPaid(0); setMethod("Naqt");
    setPickProduct(""); setPickQty(0); setErrors({});
  }

  function addRow() {
    if (!pickedProduct || !shop || pickQty <= 0) {
      toast.error("Mahsulot va miqdorni tanlang");
      return;
    }
    if (pickQty > pickedStock) {
      toast.error(`Omborda yetarli emas (mavjud: ${pickedStock})`);
      return;
    }
    setRows((r) => [
      ...r,
      { productId: Number(pickedProduct.id), name: pickedProduct.name, unit: pickedProduct.unit, qty: pickQty, price: previewPrice },
    ]);
    setPickProduct(""); setPickQty(0);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!shop) e.shop = "Buyurtmachi tanlanmagan";
    if (!agent) e.agent = "Savdo vakili tanlanmagan";
    if (rows.length === 0) e.rows = "Kamida bitta mahsulot qo'shing";
    setErrors(e);
    if (Object.keys(e).length) return;
    const paymentMethod = method === "Naqt" ? "cash" : method === "Plastik" ? "terminal" : "transfer";
    createOrderMutation.mutate(
      {
        order_date: date,
        order_number: orderId,
        agent_id: agent!.id,
        shop_id: shop!.id,
        items: rows.map((r) => ({
          product_type_id: r.productId,
          quantity: r.qty,
          unit_price: r.price,
        })),
        paid_amount: paid,
        payment_method: paymentMethod,
      },
      {
        onSuccess: () => {
          toast.success("Buyurtma muvaffaqiyatli yaratildi");
          onOpenChange(false);
          reset();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Buyurtma yaratishda xatolik");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Yangi buyurtma</DialogTitle></DialogHeader>

        <section className="space-y-3">
          <h3 className="font-semibold text-sm">1. Buyurtma ma'lumotlari</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Sana</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Buyurtma raqami</Label><Input value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
            <div>
              <Label>Savdo vakili</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{agents.map((a) => <SelectItem key={a.id} value={String(a.id)}>{`${a.firstName} ${a.lastName}`.trim()}</SelectItem>)}</SelectContent>
              </Select>
              {errors.agent && <p className="text-xs text-destructive mt-1">{errors.agent}</p>}
            </div>
            <div>
              <Label>Buyurtmachi (do'kon)</Label>
              <div className="flex gap-2 items-center">
                <Select value={shopId} onValueChange={setShopId}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{shops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.storeName}</SelectItem>)}</SelectContent>
                </Select>
                {shop && <span className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground whitespace-nowrap">{catLabel[(shop.category === "Retail" ? "retail" : shop.category === "VIP" ? "vip" : "dealer")]}</span>}
              </div>
              {errors.shop && <p className="text-xs text-destructive mt-1">{errors.shop}</p>}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-sm">2. Mahsulotlar</h3>
          <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <Label className="text-xs">Mahsulot</Label>
              <Select value={pickProduct} onValueChange={setPickProduct}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {productTypes.filter((p) => p.type === "TM").map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Miqdori</Label>
              <Input type="number" min={0} value={pickQty || ""} onChange={(e) => setPickQty(Number(e.target.value) || 0)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Narxi</Label>
              <Input value={previewPrice ? formatNumber(previewPrice) : "—"} readOnly />
            </div>
            <div className="col-span-2">
              <Button type="button" size="sm" className="w-full gap-1" onClick={addRow} disabled={!shop || !pickedProduct || !pickQty}>
                <Plus className="h-4 w-4" /> Qo'shish
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>№</th><th>Nomi</th><th>Miqdori</th><th>O'lchov</th><th>Narxi</th><th>Jami</th><th></th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-6">Mahsulot qo'shilmagan</td></tr>}
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td>{r.name}</td><td className="tabular-nums">{r.qty}</td><td>{r.unit}</td>
                    <td className="tabular-nums">{formatNumber(r.price)}</td>
                    <td className="tabular-nums font-semibold">{formatNumber(r.qty * r.price)}</td>
                    <td><button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
              {rows.length > 0 && <tfoot><tr><td colSpan={5} className="text-right font-semibold">Jami:</td><td className="tabular-nums font-bold">{formatNumber(total)} so'm</td><td></td></tr></tfoot>}
            </table>
          </div>
          {errors.rows && <p className="text-xs text-destructive">{errors.rows}</p>}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-sm">3. To'lov</h3>
          <div className="grid grid-cols-4 gap-3">
            <div><Label>Umumiy summa</Label><Input value={formatNumber(total)} readOnly /></div>
            <div><Label>Hozir to'langan</Label><Input type="number" min={0} value={paid || ""} onChange={(e) => setPaid(Number(e.target.value) || 0)} /></div>
            <div>
              <Label>To'lov usuli</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Naqt">Naqt</SelectItem>
                  <SelectItem value="Plastik">Plastik</SelectItem>
                  <SelectItem value="O'tkazma">O'tkazma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Qoldiq</Label><Input value={formatNumber(remain)} readOnly className={remain > 0 ? "text-destructive font-semibold" : ""} /></div>
          </div>
          <div className="text-xs text-muted-foreground">Holati: <span className="font-semibold">{status}</span></div>
        </section>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={save} disabled={createOrderMutation.isPending}>
            {createOrderMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
