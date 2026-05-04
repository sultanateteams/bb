import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PriceTier } from "../types";

interface Props {
  tier: PriceTier;
  onChange: (tier: PriceTier) => void;
  onRemove: () => void;
  isLast: boolean;
}

export function PriceTierRow({ tier, onChange, onRemove, isLast }: Props) {
  return (
    <div className="grid grid-cols-12 gap-3 items-end py-2 border-b last:border-b-0">
      <div className="col-span-3">
        <Label>Dan</Label>
        <Input
          type="number"
          min={1}
          value={tier.fromQty}
          onChange={(event) => onChange({ ...tier, fromQty: Number(event.target.value) })}
        />
      </div>
      <div className="col-span-3">
        <Label>Gacha</Label>
        <Input
          type="number"
          min={tier.fromQty}
          value={tier.toQty ?? ""}
          placeholder={isLast ? "∞" : ""}
          onChange={(event) =>
            onChange({
              ...tier,
              toQty: event.target.value === "" ? null : Number(event.target.value),
            })
          }
        />
      </div>
      <div className="col-span-4">
        <Label>Narx</Label>
        <Input
          type="number"
          min={1}
          value={tier.price}
          onChange={(event) => onChange({ ...tier, price: Number(event.target.value) })}
        />
      </div>
      <div className="col-span-2">
        <Button variant="outline" className="mt-5 w-full" onClick={onRemove}>
          O'chirish
        </Button>
      </div>
    </div>
  );
}
