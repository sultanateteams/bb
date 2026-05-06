import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmborStore, addPaymentToImportLegacy } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyId: number;
}

export function PaymentDialog({ open, onOpenChange, historyId }: PaymentDialogProps) {
  const history = useOmborStore((s) => s.history);
  const suppliers = useOmborStore((s) => s.suppliers);
  const importRecord = history.find((h) => h.id === historyId);
  const [summa, setSumma] = useState("");
  const [usul, setUsul] = useState<"naqt" | "plastik" | "otkazma">("naqt");
  const [izoh, setIzoh] = useState("");
  const [sana, setSana] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!importRecord) return null;

  const supplier = suppliers.find((s) => s.id === importRecord.tamirotchi_id);
  const maxSumma = importRecord.qoldiq || 0;
  const summaNum = parseFloat(summa) || 0;

  // Overdue check
  const deadline = importRecord.tolov_muddati ? new Date(importRecord.tolov_muddati) : null;
  const today = new Date();
  const isOverdue = deadline && deadline < today;
  const overdueDays = isOverdue ? Math.ceil((today.getTime() - deadline!.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Preview calculations
  const newTolangan = (importRecord.tolangan_summa || 0) + summaNum;
  const newQoldiq = Math.max(0, maxSumma - summaNum);
  const willBeFullyPaid = summaNum >= maxSumma && summaNum > 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!summa.trim()) newErrors.summa = "Summa majburiy";
    else if (isNaN(parseFloat(summa)) || summaNum <= 0) newErrors.summa = "Summa 0 dan katta bo'lishi kerak";
    else if (summaNum > maxSumma) newErrors.summa = `Qarz miqdoridan oshib ketdi (max: ${formatNumber(maxSumma)} so'm)`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const dateObj = new Date(sana);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const uzbekDate = `${day}.${month}.${year}`;

      addPaymentToImportLegacy({
        historyId,
        summa: summaNum,
        usul,
        izoh: izoh || undefined,
        sana: uzbekDate,
      });

      if (willBeFullyPaid) {
        toast.success("✅ To'lov qabul qilindi. Qarz to'liq yopildi!");
      } else {
        toast.success(`✅ To'lov qabul qilindi. Qolgan qarz: ${formatNumber(newQoldiq)} so'm`);
      }

      onOpenChange(false);
      setSumma(""); setIzoh(""); setLoading(false);
    } catch {
      toast.error("Xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>To'lov qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info block */}
          <div className="rounded-lg border bg-gray-50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ta'minotchi:</span>
              <span className="font-medium">{supplier?.nomi || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Import:</span>
              <span className="font-medium">
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 mr-1">
                  {importRecord.import_turi === "xomashiyo" ? "Xomashiyo" : importRecord.import_turi === "tm" ? "TM" : "WL"}
                </span>
                {importRecord.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jami summa:</span>
              <span className="font-medium">{formatNumber(importRecord.jami_summa || 0)} so'm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To'langan:</span>
              <span className="font-medium">{formatNumber(importRecord.tolangan_summa || 0)} so'm</span>
            </div>
            <div className="flex justify-between border-t pt-1.5">
              <span className="text-gray-600">Qolgan qarz:</span>
              <span className="font-bold text-red-600">{formatNumber(maxSumma)} so'm</span>
            </div>
          </div>

          {isOverdue && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              ⚠️ Muddati {overdueDays} kun oldin o'tgan
            </div>
          )}

          {/* Form */}
          <div className="space-y-1.5">
            <Label>To'lov summasi <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0"
                value={summa}
                onChange={(e) => setSumma(e.target.value)}
                className={errors.summa ? "border-red-500" : ""}
              />
              <Button variant="outline" onClick={() => setSumma(String(maxSumma))} className="whitespace-nowrap">
                To'liq to'lash — {formatNumber(maxSumma)} so'm
              </Button>
            </div>
            {errors.summa && <p className="text-red-500 text-xs">{errors.summa}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>To'lov usuli <span className="text-red-500">*</span></Label>
            <Select value={usul} onValueChange={(v) => setUsul(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="naqt">Naqd</SelectItem>
                <SelectItem value="plastik">Plastik</SelectItem>
                <SelectItem value="otkazma">O'tkazma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Sana <span className="text-red-500">*</span></Label>
            <Input type="date" value={sana} onChange={(e) => setSana(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Izoh</Label>
            <Input placeholder="Qo'shimcha izoh (ixtiyoriy)" value={izoh} onChange={(e) => setIzoh(e.target.value)} />
          </div>

          {/* Live preview */}
          {summaNum > 0 && summaNum <= maxSumma && (
            <div className={`rounded-lg border p-3 text-sm ${willBeFullyPaid ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
              <p className="font-medium mb-1">
                {willBeFullyPaid ? "✅ To'liq to'langan bo'ladi" : "⚠️ Qisman to'lov"}
              </p>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span>To'langan:</span>
                  <span className="font-medium">{formatNumber(newTolangan)} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Qolgan:</span>
                  <span className="font-medium">{formatNumber(newQoldiq)} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Holat:</span>
                  <span className={`font-medium ${willBeFullyPaid ? "text-green-700" : "text-orange-700"}`}>
                    {willBeFullyPaid ? "To'langan" : "Qisman"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit} disabled={loading}>To'lovni saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
