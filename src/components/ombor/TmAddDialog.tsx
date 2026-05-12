import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getProductTypes } from "@/services/product-types.service";
import { formatNumber } from "@/lib/utils";
import { SupplierSelect } from "@/components/shared/SupplierSelect";
import { PaymentSection } from "@/components/shared/PaymentSection";
import { useCreateTmPurchaseMutation } from "@/hooks/api/tm-purchases.hooks";

interface Row {
  key: string;
  productId: string;
  qty: string;
  price: string;
  note: string;
}

const newRow = (): Row => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  qty: "",
  price: "",
  note: "",
});

export function TmAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDueDate, setPaymentDueDate] = useState("");

  const { data: allProducts = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: getProductTypes,
  });

  const tmProducts = useMemo(() => allProducts.filter((p) => p.type === "TM" && p.isActive), [allProducts]);

  const createMutation = useCreateTmPurchaseMutation();

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const totalSum = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.price) || 0), 0);
  const qoldiq = Math.max(0, totalSum - paidAmount);

  const reset = () => {
    setRows([newRow()]);
    setErrors({});
    setSupplierId(null);
    setPaidAmount(0);
    setPaymentMethod("cash");
    setPaymentDueDate("");
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    rows.forEach((r) => {
      if (!r.productId) errs[`p-${r.key}`] = "Mahsulot tanlang";
      if (!r.qty || Number(r.qty) <= 0) errs[`q-${r.key}`] = "Miqdor > 0";
      if (!r.price || Number(r.price) <= 0) errs[`pr-${r.key}`] = "Narx > 0";
    });
    if (!supplierId) errs.supplier = "Ta'minotchi tanlang";
    if (paidAmount > totalSum) errs.t = "To'langan summa jami summadan oshib ketdi";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createMutation.mutate(
      {
        purchase_type: "tm",
        supplier_id: Number(supplierId),
        items: rows.map((r) => ({
          product_type_id: Number(r.productId),
          quantity: Number(r.qty),
          unit_price: Number(r.price),
          notes: r.note || undefined,
        })),
        paid_amount: paidAmount,
        payment_method: paymentMethod,
        payment_due_date: paymentDueDate || undefined,
      },
      {
        onSuccess: () => {
          if (qoldiq > 0) {
            toast.success(`✅ TM mahsulot qo'shildi. Kreditorlik: ${formatNumber(qoldiq)} so'm`);
          } else {
            toast.success("✅ TM mahsulot omborga qo'shildi");
          }
          reset();
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Xatolik yuz berdi");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>TM Mahsulot Qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {rows.map((r, idx) => {
            const total = (Number(r.qty) || 0) * (Number(r.price) || 0);
            return (
              <div key={r.key} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Qator #{idx + 1}</span>
                  {rows.length > 1 && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.key)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mahsulot</Label>
                    <Select value={r.productId} onValueChange={(v) => update(r.key, { productId: v })}>
                      <SelectTrigger><SelectValue placeholder="TM mahsulot tanlang" /></SelectTrigger>
                      <SelectContent>
                        {tmProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`p-${r.key}`] && <p className="text-xs text-destructive">{errors[`p-${r.key}`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Miqdori</Label>
                    <Input type="number" min={1} value={r.qty} onChange={(e) => update(r.key, { qty: e.target.value })} />
                    {errors[`q-${r.key}`] && <p className="text-xs text-destructive">{errors[`q-${r.key}`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Narxi (dona uchun, so'm)</Label>
                    <Input type="number" min={1} value={r.price} onChange={(e) => update(r.key, { price: e.target.value })} />
                    {errors[`pr-${r.key}`] && <p className="text-xs text-destructive">{errors[`pr-${r.key}`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jami summa</Label>
                    <Input readOnly value={total ? `${formatNumber(total)} so'm` : ""} className="bg-muted/60" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Izoh (ixtiyoriy)</Label>
                    <Input value={r.note} onChange={(e) => update(r.key, { note: e.target.value })} />
                  </div>
                </div>
              </div>
            );
          })}

          <Button variant="outline" className="gap-2 w-full" onClick={() => setRows((rs) => [...rs, newRow()])}>
            <Plus className="h-4 w-4" /> Yana qo'shish
          </Button>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Umumiy summa</span>
            <span className="font-semibold tabular-nums">{formatNumber(totalSum)} so'm</span>
          </div>

          <SupplierSelect
            value={supplierId}
            onChange={setSupplierId}
            required
            error={errors.supplier}
          />

          {totalSum > 0 && (
            <PaymentSection
              jamiSumma={totalSum}
              tolanganSumma={paidAmount}
              onTolanganChange={setPaidAmount}
              tolovUsuli={paymentMethod}
              onTolovUsuliChange={setPaymentMethod}
              tolovMuddati={paymentDueDate}
              onTolovMuddatiChange={setPaymentDueDate}
            />
          )}

          {errors.t && <p className="text-xs text-destructive">{errors.t}</p>}

          {totalSum > 0 && supplierId && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <div>📦 Mahsulotlar: {rows.filter((r) => r.productId).map((r) => tmProducts.find((p) => p.id === r.productId)?.name || "—").join(", ")}</div>
              <div>💰 Jami summa: {formatNumber(totalSum)} so'm</div>
              {paidAmount > 0 && <div>✅ To'lanadi: {formatNumber(paidAmount)} so'm</div>}
              {qoldiq > 0 && <div className="text-red-600">🔴 Kreditga: {formatNumber(qoldiq)} so'm</div>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-brand"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
