import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product, ProductType, ProductUnit } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (product: Product) => Promise<void> | void;
}

const types: ProductType[] = ["ICH", "WL", "TM"];
const units: ProductUnit[] = ["dona", "upak", "kg"];

export function AddProductModal({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("ICH");
  const [unit, setUnit] = useState<ProductUnit>("dona");
  const [minStock, setMinStock] = useState(0);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setType("ICH");
      setUnit("dona");
      setMinStock(0);
      setDescription("");
      setIsSaving(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim() || !minStock) return;
    setIsSaving(true);
    const product: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      unit,
      minStock,
      description: description.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    await onCreate(product);
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Yangi mahsulot qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nomi</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mahsulot to'liq nomi" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Turi</Label>
              <Select value={type} onValueChange={(value) => setType(value as ProductType)}>
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
              <Select value={unit} onValueChange={(value) => setUnit(value as ProductUnit)}>
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
              value={minStock || ""}
              onChange={(event) => setMinStock(Number(event.target.value))}
              placeholder="10"
            />
          </div>

          <div>
            <Label>Izoh</Label>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ixtiyoriy izoh" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || !minStock || isSaving}>
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
