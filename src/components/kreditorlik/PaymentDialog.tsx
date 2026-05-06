import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOmborStore, addPaymentToImportLegacy as addPaymentToImport } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyId: number;
}

export function PaymentDialog({ open, onOpenChange, historyId }: PaymentDialogProps) {
  const history = useOmborStore((s) => s.history);
  const importRecord = history.find((h) => h.id === historyId);
  const [summa, setSumma] = useState("");
  const [usul, setUsul] = useState<"naqt" | "plastik" | "otkazma">("naqt");
  const [izoh, setIzoh] = useState("");
  const [sana, setSana] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!importRecord) return null;

  const maxSumma = importRecord.qoldiq || 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const summaNumb = parseFloat(summa);
    if (!summa.trim()) newErrors.summa = "Summa majburiy";
    else if (isNaN(summaNumb) || summaNumb <= 0) newErrors.summa = "Summa 0 dan katta bo'lishi kerak";
    else if (summaNumb > maxSumma) newErrors.summa = `Summa ${formatNumber(maxSumma)} so'mdan ko'p bo'lishi mumkin emas`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    try {
      // Convert date format to Uzbek format (DD.MM.YYYY)
      const dateObj = new Date(sana);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const uzbekDate = `${day}.${month}.${year}`;

      addPaymentToImport({
        historyId,
        summa: parseFloat(summa),
        usul,
        izoh: izoh || undefined,
        sana: uzbekDate,
      });
      toast.success("To'lov qabul qilindi");
      onOpenChange(false);
      setSumma("");
      setIzoh("");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To'lov qo'shish</DialogTitle>
          <DialogDescription>
            {importRecord.name} uchun to'lov
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ta'minotchi</label>
            <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {importRecord.tamirotchi_id ? "—" : "—"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Import</label>
            <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {importRecord.name} — {importRecord.qty} {importRecord.unit}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Qolgan qarz</label>
            <div className="rounded border bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {formatNumber(maxSumma)} so'm
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To'lov summasi <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0"
                value={summa}
                onChange={(e) => setSumma(e.target.value)}
                className={errors.summa ? "border-red-500" : ""}
              />
              <Button
                variant="outline"
                onClick={() => setSumma(String(maxSumma))}
                className="whitespace-nowrap"
              >
                To'liq to'lash
              </Button>
            </div>
            {errors.summa && <p className="text-red-500 text-xs mt-1">{errors.summa}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To'lov usuli <span className="text-red-500">*</span>
            </label>
            <select
              value={usul}
              onChange={(e) => setUsul(e.target.value as any)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="naqt">Naqd</option>
              <option value="plastik">Plastik karta</option>
              <option value="otkazma">Bank o'tkazma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sana <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={sana}
              onChange={(e) => setSana(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <Input
              placeholder="Qo'shimcha ma'lumot (ixtiyoriy)"
              value={izoh}
              onChange={(e) => setIzoh(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
