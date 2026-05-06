import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { useOmborStore, receiveWlBatchWithPayment } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { SupplierSelect } from "@/components/shared/SupplierSelect";
import { PaymentSection } from "@/components/shared/PaymentSection";

export function WlImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const wlOps = useOmborStore((s) => s.wlOps);
  const suppliers = useOmborStore((s) => s.suppliers);
  const pending = useMemo(() => wlOps.filter((w) => w.status === "Ishlab chiqarishdagi"), [wlOps]);

  const [opId, setOpId] = useState("");
  const [received, setReceived] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [tolanganSumma, setTolanganSumma] = useState(0);
  const [tolovUsuli, setTolovUsuli] = useState("naqt");
  const [tolovMuddati, setTolovMuddati] = useState("");

  const op = useMemo(() => pending.find((p) => p.id === opId), [pending, opId]);
  const expected = op?.qty ?? 0;
  const total = (Number(received) || 0) * (Number(price) || 0);
  const surplus = (Number(received) || 0) - expected;
  const qoldiq = Math.max(0, total - tolanganSumma);
  const supplierName = supplierId ? suppliers.find((s) => s.id === supplierId)?.nomi : null;

  const reset = () => {
    setOpId(""); setReceived(""); setPrice(""); setErrors({});
    setSupplierId(null); setTolanganSumma(0); setTolovUsuli("naqt"); setTolovMuddati("");
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!opId) errs.op = "WL partiyani tanlang";
    if (!received || Number(received) <= 0) errs.r = "Miqdor > 0";
    if (!price || Number(price) <= 0) errs.p = "Narx > 0";
    if (tolanganSumma > total) errs.t = "To'langan summa jami summadan oshib ketdi";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    receiveWlBatchWithPayment({
      opId,
      receivedQty: Number(received),
      pricePerUnit: Number(price),
      supplierId: supplierId || undefined,
      tolanganSumma,
      tolovUsuli,
      tolovMuddati: tolovMuddati || undefined,
    });

    if (qoldiq > 0) {
      toast.success(`✅ WL mahsulot qabul qilindi. Kreditorlik: ${formatNumber(qoldiq)} so'm`);
    } else {
      toast.success("✅ WL mahsulot omborga qabul qilindi");
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WL Mahsulot Qabul Qilish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>WL partiya</Label>
            <Select value={opId} onValueChange={setOpId}>
              <SelectTrigger><SelectValue placeholder="Ishlab chiqarishdagi WLni tanlang" /></SelectTrigger>
              <SelectContent>
                {pending.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Kutilayotgan partiya yo'q</div>}
                {pending.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.id} — {p.product} ({p.factory})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.op && <p className="text-xs text-destructive">{errors.op}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kutilgan miqdor</Label>
              <Input readOnly value={op ? `${expected} dona` : ""} className="bg-muted/60" />
            </div>
            <div className="space-y-1.5">
              <Label>Qabul qilingan miqdor</Label>
              <Input type="number" min={1} value={received} onChange={(e) => setReceived(e.target.value)} />
              {errors.r && <p className="text-xs text-destructive">{errors.r}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Narxi (dona uchun)</Label>
              <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
              {errors.p && <p className="text-xs text-destructive">{errors.p}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Jami summa</Label>
              <Input readOnly value={total ? `${formatNumber(total)} so'm` : ""} className="bg-muted/60" />
            </div>
          </div>

          {surplus > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-info/10 text-info px-3 py-2 text-xs">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Ortiqcha miqdor: <b>{surplus} dona</b> — bonus sifatida omborga qo'shiladi.</span>
            </div>
          )}

          <SupplierSelect value={supplierId} onChange={setSupplierId} />

          {total > 0 && (
            <PaymentSection
              jamiSumma={total}
              tolanganSumma={tolanganSumma}
              onTolanganChange={setTolanganSumma}
              tolovUsuli={tolovUsuli}
              onTolovUsuliChange={setTolovUsuli}
              tolovMuddati={tolovMuddati}
              onTolovMuddatiChange={setTolovMuddati}
            />
          )}

          {total > 0 && op && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <div>📦 Mahsulot: {op.product}</div>
              <div>📏 Qabul qilindi: {received} dona</div>
              <div>💳 Jami summa: {formatNumber(total)} so'm</div>
              {tolanganSumma > 0 && <div>✅ To'lanadi: {formatNumber(tolanganSumma)} so'm</div>}
              {qoldiq > 0 && <div className="text-red-600">🔴 Kreditga: {formatNumber(qoldiq)} so'm</div>}
              <div>🏢 Ta'minotchi: {supplierName || "—"}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSave} className="bg-gradient-brand">Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
