import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, ProductType, ProductUnit } from "../types";

interface Props {
  product: Product;
  onChange: (product: Product) => void;
}

const types: ProductType[] = ["ICH", "WL", "TM"];
const units: ProductUnit[] = ["dona", "upak", "kg"];

export function ProductInfoTab({ product, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nomi</Label>
        <Input value={product.name} onChange={(event) => onChange({ ...product, name: event.target.value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Turi</Label>
          <Select value={product.type} onValueChange={(value) => onChange({ ...product, type: value as ProductType })}>
            <SelectTrigger>
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {types.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>O'lchov birligi</Label>
          <Select value={product.unit} onValueChange={(value) => onChange({ ...product, unit: value as ProductUnit })}>
            <SelectTrigger>
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {units.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Minimum qoldiq</Label>
        <Input
          type="number"
          min={0}
          value={product.minStock}
          onChange={(event) => onChange({ ...product, minStock: Number(event.target.value) })}
        />
      </div>
      <div>
        <Label>Izoh</Label>
        <Textarea
          value={product.description ?? ""}
          onChange={(event) => onChange({ ...product, description: event.target.value })}
        />
      </div>
    </div>
  );
}
