import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

interface PaymentSectionProps {
  jamiSumma: number;
  tolanganSumma: number;
  onTolanganChange: (value: number) => void;
  tolovUsuli: string;
  onTolovUsuliChange: (usul: string) => void;
  tolovMuddati: string;
  onTolovMuddatiChange: (date: string) => void;
}

export function PaymentSection({
  jamiSumma, tolanganSumma, onTolanganChange,
  tolovUsuli, onTolovUsuliChange,
  tolovMuddati, onTolovMuddatiChange,
}: PaymentSectionProps) {
  const qoldiq = jamiSumma - tolanganSumma;
  const isOverpaid = tolanganSumma > jamiSumma;

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
      <h4 className="text-sm font-semibold">To'lov ma'lumotlari</h4>

      <div className="space-y-1.5">
        <Label>Hozir to'langan summa</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            value={tolanganSumma || ""}
            onChange={(e) => onTolanganChange(Number(e.target.value) || 0)}
            placeholder="0"
          />
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => onTolanganChange(jamiSumma)}
          >
            Hammasi to'lash
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">0 kiriting — agar hozir to'lanmasa</p>
        {isOverpaid && <p className="text-xs text-destructive">To'langan summa jami summadan oshib ketdi</p>}
      </div>

      {tolanganSumma > 0 && (
        <div className="space-y-1.5">
          <Label>To'lov usuli *</Label>
          <Select value={tolovUsuli} onValueChange={onTolovUsuliChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="naqt">Naqd</SelectItem>
              <SelectItem value="plastik">Plastik</SelectItem>
              <SelectItem value="otkazma">O'tkazma</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {qoldiq > 0 && !isOverpaid && (
        <>
          <div className="rounded bg-orange-50 px-3 py-2 text-sm">
            <span className="text-orange-700 font-medium">
              Kreditorlik (qoldiq): {formatNumber(qoldiq)} so'm
            </span>
            <p className="text-xs text-orange-600 mt-0.5">Ta'minotchiga qarz qoladi</p>
          </div>

          <div className="space-y-1.5">
            <Label>To'lov muddati (ixtiyoriy)</Label>
            <Input
              type="date"
              value={tolovMuddati}
              onChange={(e) => onTolovMuddatiChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Ta'minotchi bilan kelishilgan to'lov sanasi</p>
          </div>
        </>
      )}
    </div>
  );
}
