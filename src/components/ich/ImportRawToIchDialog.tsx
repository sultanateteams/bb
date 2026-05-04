import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { useOmborStore, transferRawToIch } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";

export function ImportRawToIchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const raw = useOmborStore((s) => s.raw);
  const ichRawList = useMemo(() => raw.filter((r) => r.branch === "ich"), [raw]);
  const [matId, setMatId] = useState("");
  const [qty, setQty] = useState("");

  const mat = useMemo(() => raw.find((r) => String(r.id) === matId), [raw, matId]);
  const qtyNum = Number(qty) || 0;
  const exceeds = mat ? qtyNum > mat.stock : false;

  useEffect(() => { if (!open) { setMatId(""); setQty(""); } }, [open]);

  const handleSave = () => {
    if (!mat || qtyNum <= 0 || exceeds) return;
    transferRawToIch(mat.id, qtyNum);
    toast.success("Xomashiyo ICH omboriga o'tkazildi");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>ICH Omboriga Xomashiyo O'tkazish</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 p-3 rounded-md bg-muted text-sm">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-info" />
          <span>Bu ichki ko'chirish — asosiy ombordan ICH omboriga o'tkaziladi. Chiqim yaratilmaydi.</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Xomashiyo</Label>
            <Select value={matId} onValueChange={setMatId}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                {ichRawList.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name} ({r.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mat && (
            <div className="space-y-1.5">
              <Label>Asosiy ombor qoldig'i</Label>
              <Input readOnly value={`Asosiy omborda: ${formatNumber(mat.stock)} ${mat.unit}`} className="bg-muted/60" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Miqdori {mat ? `(${mat.unit})` : ""}</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            {exceeds && <p className="text-xs text-destructive">Asosiy ombor qoldig'idan oshib ketdi</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSave} disabled={!mat || qtyNum <= 0 || exceeds} className="bg-gradient-brand">Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
