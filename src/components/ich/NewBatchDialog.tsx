import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useOmborStore, calcBomNeeds, produceIch, type ProduceItem, type BomNeed } from "@/lib/omborStore";
import { StatusBadge } from "@/components/Badges";
import { formatNumber } from "@/lib/utils";

interface Row { productId: string; qty: string; }

export function NewBatchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const products = useOmborStore((s) => s.products);
  const ichRaw = useOmborStore((s) => s.ichRaw);
  const ichProducts = useMemo(() => products.filter((p) => p.branch === "ich"), [products]);

  const [rows, setRows] = useState<Row[]>([{ productId: "", qty: "" }]);
  const [needs, setNeeds] = useState<BomNeed[]>([]);

  useEffect(() => {
    if (!open) {
      setRows([{ productId: "", qty: "" }]);
      setNeeds([]);
    }
  }, [open]);

  // re-calc whenever rows change
  useEffect(() => {
    const items: ProduceItem[] = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => ({ productId: Number(r.productId), qty: Number(r.qty) }));
    setNeeds(calcBomNeeds(items));
  }, [rows]);

  const updateNeed = (materialId: number, val: string) => {
    setNeeds((prev) => prev.map((n) => n.materialId === materialId ? { ...n, need: Number(val) || 0 } : n));
  };

  const stockOf = (mid: number) => ichRaw.find((r) => r.materialId === mid)?.stock ?? 0;
  const insufficient = needs.some((n) => n.need > stockOf(n.materialId));
  const valid = rows.some((r) => r.productId && Number(r.qty) > 0) && needs.length > 0 && !insufficient;

  const handleSave = () => {
    if (!valid) return;
    const items: ProduceItem[] = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => ({ productId: Number(r.productId), qty: Number(r.qty) }));
    produceIch(items, needs);
    toast.success("Partiya muvaffaqiyatli yaratildi");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ICH — Tayyor Mahsulot Chiqarish</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Mahsulotlar</Label>
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <Select value={r.productId} onValueChange={(v) => setRows((p) => p.map((x, j) => j === i ? { ...x, productId: v } : x))}>
                    <SelectTrigger><SelectValue placeholder="ICH mahsulot tanlang" /></SelectTrigger>
                    <SelectContent>
                      {ichProducts.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input className="w-32" type="number" min={1} placeholder="Miqdor" value={r.qty}
                  onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, qty: e.target.value } : x))} />
                <Button variant="ghost" size="icon" disabled={rows.length === 1}
                  onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setRows((p) => [...p, { productId: "", qty: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Yana mahsulot qo'shish
            </Button>
          </div>

          {needs.length > 0 && (
            <div className="space-y-2">
              <Label>BOM asosida xomashiyo sarfi</Label>
              <div className="rounded-lg border overflow-hidden">
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th>Xomashiyo</th>
                      <th>O'lchov</th>
                      <th>Kerakli miqdor</th>
                      <th>ICH ombordagi qoldiq</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needs.map((n) => {
                      const stock = stockOf(n.materialId);
                      const ok = stock >= n.need;
                      return (
                        <tr key={n.materialId}>
                          <td className="font-medium">{n.name}</td>
                          <td>{n.unit}</td>
                          <td>
                            <Input type="number" min={0} step="any" value={n.need}
                              onChange={(e) => updateNeed(n.materialId, e.target.value)}
                              className="h-8 w-28" />
                          </td>
                          <td className="tabular-nums">{formatNumber(stock)} {n.unit}</td>
                          <td>
                            <StatusBadge status={ok ? "Yetarli" : "Yetarlicha emas"} tone={ok ? "success" : "danger"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {insufficient && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Yetarlicha xomashiyo yo'q. ICH omborini to'ldiring.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSave} disabled={!valid} className="bg-gradient-brand">Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
