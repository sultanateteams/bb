import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddOrderTransactionMutation } from "@/hooks/api/orders.hooks";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export function PaymentDialog({ open, onOpenChange, orderId, remain }: { open: boolean; onOpenChange: (v: boolean) => void; orderId: number; remain: number; }) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<"cash" | "terminal" | "transfer">("cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const addPayment = useAddOrderTransactionMutation(orderId);

  async function save() {
    if (amount <= 0) { setError("Summa 0 dan katta bo'lishi kerak"); return; }
    if (amount > remain) { setError(`Qoldiqdan oshmasligi kerak (${formatNumber(remain)})`); return; }

    await addPayment.mutateAsync({
      amount,
      payment_method: method,
      payment_date: paymentDate || undefined,
      notes: notes || undefined,
    });

    toast.success("To'lov muvaffaqiyatli qo'shildi");
    onOpenChange(false);
    setAmount(0);
    setError("");
    setPaymentDate("");
    setNotes("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>To'lov qo'shish</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Qoldiq: <span className="font-semibold text-foreground">{formatNumber(remain)} so'm</span></div>
          <div>
            <Label>Summa</Label>
            <Input type="number" value={amount || ""} onChange={(e) => { setAmount(Number(e.target.value) || 0); setError(""); }} />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <div>
            <Label>To'lov usuli</Label>
            <Select value={method} onValueChange={(v: "cash" | "terminal" | "transfer") => setMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Naqt</SelectItem>
                <SelectItem value="terminal">Terminal</SelectItem>
                <SelectItem value="transfer">O'tkazma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>To'lov sanasi</Label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <div>
            <Label>Izoh</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ixtiyoriy" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={save} disabled={addPayment.isPending}>{addPayment.isPending ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
