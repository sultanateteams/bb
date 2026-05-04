import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { discardToMakulatura } from "@/lib/omborStore";
import type { AstatkaItem } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";

export function MakulaturaDialog({
  open, onOpenChange, items, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: AstatkaItem[];
  onDone?: () => void;
}) {
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { if (!open) { setPrice(""); setNote(""); setErr(""); } }, [open]);

  const handleSave = () => {
    const p = Number(price);
    if (!p || p <= 0) { setErr("Narxi > 0 bo'lishi kerak"); return; }
    discardToMakulatura(items.map((i) => i.id), p, note || undefined);
    toast.success("Makulaturaga chiqarildi. Kirim yozuvi yaratildi.");
    onDone?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Makulaturaga Chiqarish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 space-y-1">
            {items.map((i) => (
              <div key={i.id} className="text-sm flex justify-between">
                <span>{i.name}</span>
                <span className="tabular-nums text-muted-foreground">{formatNumber(i.qty)} {i.unit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Makulatura narxi (so'm)</Label>
            <Input type="number" min={1} value={price} onChange={(e) => { setPrice(e.target.value); setErr(""); }} />
            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Izoh</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ixtiyoriy" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSave} className="bg-gradient-brand">Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
