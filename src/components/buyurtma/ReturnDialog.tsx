import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { returnReasons, type Order } from "@/lib/mockData";
import { addOrderReturn } from "@/lib/omborStore";
import { toast } from "sonner";

export function ReturnDialog({ open, onOpenChange, order }: { open: boolean; onOpenChange: (v: boolean) => void; order: Order; }) {
  const [productId, setProductId] = useState<string>("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const item = order.items.find((i) => i.productId === Number(productId));
  const reasonObj = returnReasons.find((r) => r.value === reason);
  const maxQty = item ? item.qty - (item.returned ?? 0) : 0;

  function save() {
    const e: Record<string, string> = {};
    if (!item) e.product = "Mahsulot tanlanmagan";
    if (qty <= 0) e.qty = "Miqdor kiriting";
    if (item && qty > maxQty) e.qty = `Maksimal: ${maxQty}`;
    if (!reasonObj) e.reason = "Sabab tanlanmagan";
    setErrors(e);
    if (Object.keys(e).length) return;
    addOrderReturn({
      orderId: order.id, productId: item!.productId, qty,
      reason: reasonObj!.value, reasonLabel: reasonObj!.label, note,
    });
    toast.success("Qaytarish rasmiylashtirildi");
    onOpenChange(false);
    setProductId(""); setQty(0); setReason(""); setNote(""); setErrors({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Mahsulot Qaytarish</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Mahsulot</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                {order.items.map((i) => (
                  <SelectItem key={i.productId} value={String(i.productId)}>{i.name} (buyurtmada {i.qty} {i.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product && <p className="text-xs text-destructive mt-1">{errors.product}</p>}
          </div>
          <div>
            <Label>Qaytarilgan miqdori {item && <span className="text-muted-foreground">(max {maxQty})</span>}</Label>
            <Input type="number" min={0} value={qty || ""} onChange={(e) => setQty(Number(e.target.value) || 0)} />
            {errors.qty && <p className="text-xs text-destructive mt-1">{errors.qty}</p>}
          </div>
          <div>
            <Label>Qaytarish sababi</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                {returnReasons.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason}</p>}
            {reasonObj && <p className="text-xs text-muted-foreground mt-1">{reasonObj.info}</p>}
          </div>
          <div>
            <Label>Izoh</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button variant="destructive" onClick={save}>Qaytarishni rasmiylashtirish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
