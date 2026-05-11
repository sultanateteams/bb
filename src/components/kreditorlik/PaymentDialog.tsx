import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { useTmPurchaseByIDQuery, useAddTmTransactionMutation, TM_PURCHASES_KEY } from "@/hooks/api/tm-purchases.hooks";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: number;
}

export function PaymentDialog({ open, onOpenChange, purchaseId }: PaymentDialogProps) {
  const qc = useQueryClient();
  const { data: purchase } = useTmPurchaseByIDQuery(purchaseId);
  const addTransaction = useAddTmTransactionMutation(purchaseId);

  const [summa, setSumma] = useState("");
  const [usul, setUsul] = useState<"cash" | "terminal" | "transfer">("cash");
  const [izoh, setIzoh] = useState("");
  const [sana, setSana] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!purchase) return null;

  const maxSumma = purchase.debt_amount;
  const summaNum = parseFloat(summa) || 0;

  const today = new Date();
  const deadline = purchase.payment_due_date ? new Date(purchase.payment_due_date) : null;
  const isOverdue = deadline && deadline < today;
  const overdueDays = isOverdue
    ? Math.ceil((today.getTime() - deadline!.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const newPaid = purchase.paid_amount + summaNum;
  const newDebt = Math.max(0, maxSumma - summaNum);
  const willBeFullyPaid = summaNum >= maxSumma && summaNum > 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!summa.trim()) errs.summa = "Summa majburiy";
    else if (isNaN(summaNum) || summaNum <= 0) errs.summa = "Summa 0 dan katta bo'lishi kerak";
    else if (summaNum > maxSumma)
      errs.summa = `Qarz miqdoridan oshib ketdi (max: ${formatNumber(maxSumma)} so'm)`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await addTransaction.mutateAsync({
        amount: summaNum,
        payment_method: usul,
        payment_date: sana,
        notes: izoh || undefined,
      });

      // refresh list and detail
      qc.invalidateQueries({ queryKey: TM_PURCHASES_KEY });

      if (willBeFullyPaid) {
        toast.success("✅ To'lov qabul qilindi. Qarz to'liq yopildi!");
      } else {
        toast.success(`✅ To'lov qabul qilindi. Qolgan qarz: ${formatNumber(newDebt)} so'm`);
      }

      onOpenChange(false);
      setSumma("");
      setIzoh("");
    } catch {
      toast.error("Xatolik yuz berdi");
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
              <span className="font-medium">{purchase.supplier_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Import:</span>
              <span className="font-medium text-xs text-gray-700">
                {purchase.items.map((i) => i.product_type_name).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jami summa:</span>
              <span className="font-medium">{formatNumber(purchase.total_amount)} so'm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To'langan:</span>
              <span className="font-medium text-green-600">
                {formatNumber(purchase.paid_amount)} so'm
              </span>
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
            <Label>
              To'lov summasi <span className="text-red-500">*</span>
            </Label>
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
                To'liq to'lash — {formatNumber(maxSumma)} so'm
              </Button>
            </div>
            {errors.summa && <p className="text-red-500 text-xs">{errors.summa}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>
              To'lov usuli <span className="text-red-500">*</span>
            </Label>
            <Select value={usul} onValueChange={(v) => setUsul(v as typeof usul)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Naqd</SelectItem>
                <SelectItem value="terminal">Terminal</SelectItem>
                <SelectItem value="transfer">O'tkazma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Sana <span className="text-red-500">*</span>
            </Label>
            <Input type="date" value={sana} onChange={(e) => setSana(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Izoh</Label>
            <Input
              placeholder="Qo'shimcha izoh (ixtiyoriy)"
              value={izoh}
              onChange={(e) => setIzoh(e.target.value)}
            />
          </div>

          {/* Live preview */}
          {summaNum > 0 && summaNum <= maxSumma && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                willBeFullyPaid
                  ? "bg-green-50 border-green-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p className="font-medium mb-1">
                {willBeFullyPaid ? "✅ To'liq to'langan bo'ladi" : "⚠️ Qisman to'lov"}
              </p>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span>To'langan:</span>
                  <span className="font-medium">{formatNumber(newPaid)} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Qolgan:</span>
                  <span className="font-medium">{formatNumber(newDebt)} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Holat:</span>
                  <span
                    className={`font-medium ${
                      willBeFullyPaid ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {willBeFullyPaid ? "To'langan" : "Qisman"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={addTransaction.isPending}>
            To'lovni saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
