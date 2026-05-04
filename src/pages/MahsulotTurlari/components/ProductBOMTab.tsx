import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RawMaterial } from "@/lib/mockData";
import type { BOMItem, ProductType, TMProductInfo, WLProductBOM } from "../types";
import { BOMItemRow } from "./BOMItemRow";

interface Props {
  productType: ProductType;
  bomData: WLProductBOM | TMProductInfo;
  rawMaterials: RawMaterial[];
  onChange: (data: WLProductBOM | TMProductInfo) => void;
  onSave: () => void;
}

const rowTemplate = (materialId: string, materialName: string, unit: string): BOMItem => ({
  id: undefined,
  rawMaterialId: materialId,
  rawMaterialName: materialName,
  unit,
  quantityPer1Unit: 0,
});

export function ProductBOMTab({ productType, bomData, rawMaterials, onChange, onSave }: Props) {
  const isTM = productType === "TM";
  const rawOptions = rawMaterials.filter((item) => item.branch === productType.toLowerCase());

  const handleAddRow = () => {
    if (isTM) return;
    const first = rawOptions[0];
    if (!first) return;
    const typed = bomData as WLProductBOM;
    onChange({
      ...typed,
      items: [
        ...typed.items,
        rowTemplate(first.id.toString(), first.name, first.unit),
      ],
    });
  };

  const handleItemChange = (index: number, item: BOMItem) => {
    const typed = bomData as WLProductBOM;
    onChange({
      ...typed,
      items: typed.items.map((row, rowIndex) => (rowIndex === index ? item : row)),
    });
  };

  const handleRemove = (index: number) => {
    const typed = bomData as WLProductBOM;
    onChange({
      ...typed,
      items: typed.items.filter((_, rowIndex) => rowIndex !== index),
    });
  };

  if (isTM) {
    const info = bomData as TMProductInfo;
    return (
      <div className="space-y-4">
        <div>
          <Label>Bitta upakofkada nechta</Label>
          <Input
            type="number"
            min={0}
            value={info.unitsPerPackage ?? ""}
            onChange={(event) => onChange({ ...info, unitsPerPackage: Number(event.target.value) || undefined })}
          />
        </div>
        <p className="text-sm text-muted-foreground">TM mahsulotlar uchun ichki ma'lumot saqlanadi, bu omborga avtomatik ta'sir qilmaydi.</p>
        <div className="flex justify-end">
          <Button onClick={onSave}>Saqlash</Button>
        </div>
      </div>
    );
  }

  const bom = bomData as WLProductBOM;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {bom.items.map((item, index) => (
          <BOMItemRow
            key={`${item.rawMaterialId}-${index}`}
            item={item}
            rawMaterials={rawOptions}
            onChange={(value) => handleItemChange(index, value)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>
      <Button variant="outline" onClick={handleAddRow} disabled={rawOptions.length === 0}>
        + Xomashiyo qo'shish
      </Button>
      {productType === "WL" && (
        <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
          <Label>Zavod xizmat haqi</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              value={bom.serviceChargePerUnit}
              onChange={(event) => onChange({ ...bom, serviceChargePerUnit: Number(event.target.value) })}
              placeholder="so'm / dona"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={onSave}>Saqlash</Button>
      </div>
    </div>
  );
}
