import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/utils";
import { getWLProduction, receiveWLProduction, type WLProductionListItem } from "@/services/wl-productions.service";
import { toast } from "sonner";

interface Props {
  record: WLProductionListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WLDetailModal({ record, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [receivedQuantity, setReceivedQuantity] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  const { data: detail } = useQuery({
    queryKey: ["wl-productions", record?.id],
    queryFn: () => getWLProduction(record!.id),
    enabled: !!record?.id && open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      receiveWLProduction(record!.id, {
        received_quantity: receivedQuantity,
        price_per_unit: pricePerUnit,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wl-productions"] });
      toast.success("Mahsulot qabul qilindi");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Xatolik yuz berdi");
    },
  });

  if (!record) return null;

  const materials = detail?.materials ?? [];
  const items = detail?.items ?? [];

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalMaterialCost = materials.reduce((s, m) => s + m.quantity_used * m.standard_price, 0);
  const totalServiceFee = items.reduce((s, i) => {
    const pricePerUnitVal = detail?.price_per_unit ?? 0;
    return s + i.quantity * pricePerUnitVal;
  }, 0);
  const totalReceived = receivedQuantity * pricePerUnit;

  const isInProduction = record.status === "in_production";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record.wl_code} — Batafsil</DialogTitle>
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

              {materials.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Yuklanmoqda...</p>
              )}

              {materials.map((m) => (
                <div key={m.id} className="grid grid-cols-4 gap-4 text-sm">
                  <span>{m.raw_material_name}</span>
                  <span className="text-right tabular-nums">
                    {formatNumber(m.quantity_used)} {m.unit}
                  </span>
                  <span className="text-right tabular-nums">
                    {formatNumber(m.standard_price)} so'm
                  </span>
                  <span className="text-right tabular-nums">
                    {formatNumber(m.quantity_used * m.standard_price)} so'm
                  </span>
                </div>
              ))}

              {materials.length > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                    <span>Umumiy material chiqim</span>
                    <span></span>
                    <span></span>
                    <span className="text-right tabular-nums">
                      {formatNumber(totalMaterialCost)} so'm
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {isInProduction && (
            <div>
              <h3 className="text-lg font-medium mb-4">Qabul qilish</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kutilgan miqdor</Label>
                  <Input value={`${formatNumber(totalQty)} ${items[0]?.unit ?? "dona"}`} readOnly />
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
              {receivedQuantity > 0 && receivedQuantity > totalQty && (
                <p className="text-sm text-yellow-600 mt-2">
                  Ortiqcha miqdor: +{formatNumber(receivedQuantity - totalQty)} {items[0]?.unit ?? "dona"} (bonus)
                </p>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={receivedQuantity <= 0 || mutation.isPending}
                >
                  {mutation.isPending ? "Saqlanmoqda..." : "Qabul qilish"}
                </Button>
              </div>
            </div>
          )}

          {!isInProduction && record.received_quantity != null && (
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Qabul qilingan miqdor:</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(record.received_quantity)} {record.unit}
                </span>
              </div>
              {record.price_per_unit != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Narx (dona):</span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(record.price_per_unit)} so'm
                  </span>
                </div>
              )}
              {record.price_per_unit != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jami summa:</span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(record.received_quantity * record.price_per_unit)} so'm
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
