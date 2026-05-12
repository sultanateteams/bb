import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import { SupplierSelect } from "@/components/shared/SupplierSelect";
import { PaymentSection } from "@/components/shared/PaymentSection";
import { getRawMaterialTypes } from "@/services/raw-material-types.service";
import { getSuppliers } from "@/services/suppliers.service";
import { useCreateTmPurchaseMutation } from "@/hooks/api/tm-purchases.hooks";

export function XomashiyoImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [type, setType] = useState<"ich" | "wl">("ich");
  const [matId, setMatId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: allRawMaterials = [] } = useQuery({
    queryKey: ["raw-material-types"],
    queryFn: getRawMaterialTypes,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers({ is_active: true }),
  });

  const filtered = useMemo(
    () => allRawMaterials.filter((r) => r.type.toLowerCase() === type),
    [allRawMaterials, type],
  );

  const mat = useMemo(() => allRawMaterials.find((r) => r.id === matId), [allRawMaterials, matId]);

  const supplierName = useMemo(
    () => (supplierId ? (suppliers.find((s) => String(s.id) === supplierId)?.name ?? "—") : "—"),
    [suppliers, supplierId],
  );

  useEffect(() => { setMatId(""); }, [type]);

  useEffect(() => {
    if (mat) setPrice(String(mat.defaultPrice));
  }, [mat]);

  const createMutation = useCreateTmPurchaseMutation();

  const total = (Number(qty) || 0) * (Number(price) || 0);
  const qoldiq = Math.max(0, total - paidAmount);

  const reset = () => {
    setType("ich"); setMatId(""); setQty(""); setPrice(""); setNote(""); setErrors({});
    setSupplierId(null); setPaidAmount(0); setPaymentMethod("cash"); setPaymentDueDate("");
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!matId) errs.m = "Xomashiyo tanlang";
    if (!qty || Number(qty) <= 0) errs.q = "Miqdor > 0";
    if (!price || Number(price) <= 0) errs.p = "Narx > 0";
    if (!supplierId) errs.s = "Ta'minotchi tanlang";
    if (paidAmount > total) errs.t = "To'langan summa jami summadan oshib ketdi";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createMutation.mutate(
      {
        purchase_type: "raw_material",
        supplier_id: Number(supplierId),
        items: [
          {
            raw_material_type_id: Number(matId),
            quantity: Number(qty),
            unit_price: Number(price),
            notes: note || undefined,
          },
        ],
        paid_amount: paidAmount,
        payment_method: paymentMethod,
        payment_due_date: paymentDueDate || undefined,
      },
      {
        onSuccess: () => {
          if (qoldiq > 0) {
            toast.success(`✅ Xomashiyo import qilindi. Kreditorlik: ${formatNumber(qoldiq)} so'm`);
          } else {
            toast.success("✅ Xomashiyo import qilindi");
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
                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.unit})</SelectItem>
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

          <SupplierSelect
            value={supplierId}
            onChange={setSupplierId}
            required
            error={errors.s}
          />

          {total > 0 && (
            <PaymentSection
              jamiSumma={total}
              tolanganSumma={paidAmount}
              onTolanganChange={setPaidAmount}
              tolovUsuli={paymentMethod}
              onTolovUsuliChange={setPaymentMethod}
              tolovMuddati={paymentDueDate}
              onTolovMuddatiChange={setPaymentDueDate}
            />
          )}

          {errors.t && <p className="text-xs text-destructive">{errors.t}</p>}

          {total > 0 && mat && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <div>📦 Xomashiyo: {mat.name}</div>
              <div>📏 Miqdor: {qty} {mat.unit}</div>
              <div>💰 Jami summa: {formatNumber(total)} so'm</div>
              {paidAmount > 0 && <div>✅ To'lanadi: {formatNumber(paidAmount)} so'm</div>}
              {qoldiq > 0 && <div className="text-red-600">🔴 Kreditga: {formatNumber(qoldiq)} so'm</div>}
              <div>🏢 Ta'minotchi: {supplierName}</div>
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
