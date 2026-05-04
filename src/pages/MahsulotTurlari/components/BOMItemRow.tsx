import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BOMItem } from "../types";
import type { RawMaterial } from "@/lib/mockData";

interface Props {
  item: BOMItem;
  rawMaterials: RawMaterial[];
  onChange: (item: BOMItem) => void;
  onRemove: () => void;
}

export function BOMItemRow({ item, rawMaterials, onChange, onRemove }: Props) {
  const material = rawMaterials.find((m) => m.id.toString() === item.rawMaterialId);

  const handleMaterialChange = (value: string) => {
    const selected = rawMaterials.find((m) => m.id.toString() === value);
    onChange({
      ...item,
      rawMaterialId: value,
      rawMaterialName: selected?.name ?? "",
      unit: selected?.unit ?? "",
    });
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-end py-2 border-b last:border-b-0">
      <div className="col-span-5">
        <Label>Xomashiyo</Label>
        <Select value={item.rawMaterialId} onValueChange={handleMaterialChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tanlang" />
          </SelectTrigger>
          <SelectContent>
            {rawMaterials.map((raw) => (
              <SelectItem key={raw.id} value={raw.id.toString()}>
                {raw.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-3">
        <Label>Miqdori</Label>
        <Input
          type="number"
          min={0}
          value={item.quantityPer1Unit}
          onChange={(event) => onChange({ ...item, quantityPer1Unit: Number(event.target.value) })}
        />
      </div>

      <div className="col-span-2">
        <Label>O'lchov birligi</Label>
        <Input readOnly value={item.unit} />
      </div>

      <div className="col-span-2">
        <Button variant="outline" className="mt-5 w-full" onClick={onRemove}>
          O'chirish
        </Button>
      </div>
    </div>
  );
}
