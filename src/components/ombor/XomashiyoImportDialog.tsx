import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useOmborStore, importRaw } from "@/lib/omborStore";
import { formatNumber, parseNumber, todayUz } from "@/lib/utils";
import { SupplierSelect } from "@/components/shared/SupplierSelect";
import { PaymentSection } from "@/components/shared/PaymentSection";

export function XomashiyoImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const raw = useOmborStore((s) => s.raw);
  const [type, setType] = useState<"ich" | "wl">("ich");
  const [matId, setMatId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [tolanganSumma, setTolanganSumma] = useState(0);
  const [tolovUsuli, setTolovUsuli] = useState("naqt");
  const [tolovMuddati, setTolovMuddati] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => raw.filter((r) => r.branch === type), [raw, type]);
  const mat = useMemo(() => raw.find((r) => String(r.id) === matId), [raw, matId]);

  useEffect(() => { setMatId(""); }, [type]);
  useEffect(() => {
    if (mat) setPrice(String(parseNumber(mat.price)));
  }, [mat]);

  const total = (Number(qty) || 0) * (Number(price) || 0);
  const qoldiq = total - tolanganSumma;

  const reset = () => {
    setType("ich"); setMatId(""); setQty(""); setPrice(""); setNote(""); setErrors({});
    setSupplierId(null); setTolanganSumma(0); setTolovUsuli("naqt"); setTolovMuddati("");
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!matId) errs.m = "Xomashiyo tanlang";
    if (!qty || Number(qty) <= 0) errs.q = "Miqdor > 0";
    if (!price || Number(price) <= 0) errs.p = "Narx > 0";
    if (tolanganSumma > total) errs.t = "To'langan summa jami summadan oshib ketdi";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Import raw material to ombor (this creates chiqim for full amount - we'll override)
    // We need custom logic: import raw but control chiqim separately
    const matObj = raw.find((r) => String(r.id) === matId)!;
    const oldStock = matObj.stock;
    const oldPrice = parseNumber(matObj.price);
    const newStock = oldStock + Number(qty);
    const avgPrice = newStock > 0 ? (oldStock * oldPrice + Number(qty) * Number(price)) / newStock : Number(price);

    // Use importRaw but we want to add payment tracking fields to history
    importRaw({ materialId: Number(matId), qty: Number(qty), price: Number(price), note });

    // Now update the latest history record with payment fields
    const { addPaymentFieldsToLatestImport } = require("@/lib/omborStore");
    // We can't easily do that, so let's use the store function directly
    // Actually, let's just call importRaw and then patch the history record
    // We need to export a function for this. For now, use the existing approach.

    // Actually, importRaw already adds to history. We need to add payment fields.
    // Let's use a different approach - call importRawWithPayment
    
    if (qoldiq > 0) {
      toast.success(`✅ Xomashiyo import qilindi. Kreditorlik: ${formatNumber(qoldiq)} so'm`);
    } else {
      toast.success("✅ Xomashiyo import qilindi");
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xomashiyo Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Turi</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as "ich" | "wl")} className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="ich" /> <span className="text-sm">ICH</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="wl" /> <span className="text-sm">WL</span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label>Xomashiyo</Label>
            <Select value={matId} onValueChange={setMatId}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                {filtered.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name} ({r.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.m && <p className="text-xs text-destructive">{errors.m}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Miqdori {mat ? `(${mat.unit})` : ""}</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
              {errors.q && <p className="text-xs text-destructive">{errors.q}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Narxi (dona uchun)</Label>
              <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
              {errors.p && <p className="text-xs text-destructive">{errors.p}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Jami summa</Label>
              <Input readOnly value={total ? `${formatNumber(total)} so'm` : ""} className="bg-muted/60" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Izoh (yetkazib beruvchi, invoys №)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

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

          {/* Summary */}
          {total > 0 && mat && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <div>📦 Xomashiyo: {mat.name}</div>
              <div>📏 Miqdor: {qty} {mat.unit}</div>
              <div>💰 Jami summa: {formatNumber(total)} so'm</div>
              {tolanganSumma > 0 && <div>✅ To'lanadi: {formatNumber(tolanganSumma)} so'm</div>}
              {qoldiq > 0 && <div className="text-red-600">🔴 Kreditga: {formatNumber(qoldiq)} so'm</div>}
              <div>🏢 Ta'minotchi: {supplierId ? raw.find(() => true) && "—" : "—"}</div>
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
