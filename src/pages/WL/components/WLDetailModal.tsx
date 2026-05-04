import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/utils";
import type { WlOp } from "@/lib/mockData";

interface Props {
  record: WlOp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WLDetailModal({ record, open, onOpenChange }: Props) {
  const [receivedQuantity, setReceivedQuantity] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  if (!record) return null;

  const totalReceived = receivedQuantity * pricePerUnit;

  const handleReceive = () => {
    // Mock receive: update record status, add to stock
    console.log("Receiving:", { receivedQuantity, pricePerUnit, total: totalReceived });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>WL {record.id} — Batafsil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Jo'natilgan materiallar</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                <span>Xomashiyo</span>
                <span className="text-right">Miqdor</span>
                <span className="text-right">Narx</span>
                <span className="text-right">Jami</span>
              </div>
              {/* Mock materials - in real, from record.materials */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <span>Korobka 1000gr</span>
                <span className="text-right tabular-nums">200 dona</span>
                <span className="text-right tabular-nums">1200 so'm</span>
                <span className="text-right tabular-nums">240 000 so'm</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <span>Etiketka WL</span>
                <span className="text-right tabular-nums">200 dona</span>
                <span className="text-right tabular-nums">320 so'm</span>
                <span className="text-right tabular-nums">64 000 so'm</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <span>Selofan rulon</span>
                <span className="text-right tabular-nums">10 kg</span>
                <span className="text-right tabular-nums">9800 so'm</span>
                <span className="text-right tabular-nums">98 000 so'm</span>
              </div>
              <Separator />
              <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                <span>Zavod xizmat haqi</span>
                <span></span>
                <span></span>
                <span className="text-right tabular-nums">2 800 000 so'm</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                <span>Umumiy chiqim</span>
                <span></span>
                <span></span>
                <span className="text-right tabular-nums">3 202 000 so'm</span>
              </div>
            </div>
          </div>

          {record.status === "Ishlab chiqarishdagi" && (
            <div>
              <h3 className="text-lg font-medium mb-4">Qabul qilish</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kutilgan miqdor</Label>
                  <Input value={`${record.qty} dona`} readOnly />
                </div>
                <div>
                  <Label>Qabul qilingan miqdor</Label>
                  <Input
                    type="number"
                    value={receivedQuantity || ""}
                    onChange={(e) => setReceivedQuantity(parseInt(e.target.value) || 0)}
                    placeholder="350"
                  />
                </div>
                <div>
                  <Label>Narxi (dona uchun)</Label>
                  <Input
                    type="number"
                    value={pricePerUnit || ""}
                    onChange={(e) => setPricePerUnit(parseInt(e.target.value) || 0)}
                    placeholder="31500"
                  />
                </div>
                <div>
                  <Label>Jami summa</Label>
                  <Input value={`${formatNumber(totalReceived)} so'm`} readOnly />
                </div>
              </div>
              {receivedQuantity > record.qty && (
                <p className="text-sm text-yellow-600 mt-2">
                  Ortiqcha miqdor: +{receivedQuantity - record.qty} dona (bonus)
                </p>
              )}
              <div className="flex justify-end mt-4">
                <Button onClick={handleReceive}>
                  Qabul qilish
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}