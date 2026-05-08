import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { RawMaterial, RawMaterialFormData, ModalMode } from "../types";

interface RawMaterialModalProps {
  isOpen: boolean;
  mode: ModalMode;
  initialData?: RawMaterial | null;
  isSaving?: boolean;
  onClose: () => void;
  onSuccess: (item: RawMaterial) => void;
}

const validateForm = (data: RawMaterialFormData): string[] => {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push("Nomi kiritilmagan");
  if (!data.type) errors.push("Turi tanlanmagan");
  if (!data.unit) errors.push("O'lchov birligi tanlanmagan");
  if (!data.defaultPrice || Number(data.defaultPrice) <= 0)
    errors.push("Standart narx 0 dan katta bo'lishi kerak");
  if (!data.minStock || Number(data.minStock) <= 0)
    errors.push("Minimum qoldiq 0 dan katta bo'lishi kerak");
  return errors;
};

export function RawMaterialModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  onClose,
  onSuccess,
}: RawMaterialModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RawMaterialFormData>({
    name: "",
    type: "",
    unit: "",
    defaultPrice: "",
    minStock: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name,
          type: initialData.type,
          unit: initialData.unit,
          defaultPrice: initialData.defaultPrice.toString(),
          minStock: initialData.minStock.toString(),
          description: initialData.description || "",
        });
      } else {
        setFormData({ name: "", type: "", unit: "", defaultPrice: "", minStock: "", description: "" });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast({ title: "Xatolik", description: errors.join(", "), variant: "destructive" });
      return;
    }

    const item: RawMaterial = {
      id: mode === "edit" ? initialData!.id : "0",
      name: formData.name.trim(),
      type: formData.type as "ICH" | "WL",
      unit: formData.unit as RawMaterial["unit"],
      defaultPrice: Number(formData.defaultPrice),
      minStock: Number(formData.minStock),
      description: formData.description.trim() || undefined,
      createdAt: mode === "edit" ? initialData!.createdAt : new Date().toISOString().slice(0, 10),
    };

    onSuccess(item);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Yangi xomashiyo qo'shish" : "Xomashiyoni tahrirlash"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rm-name">Nomi</Label>
            <Input
              id="rm-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Xomashiyo nomi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm-type">Turi</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ICH">ICH</SelectItem>
                <SelectItem value="WL">WL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm-unit">O'lchov birligi</Label>
            <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="dona">dona</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm-price">Standart narxi (so'm)</Label>
            <Input
              id="rm-price"
              type="number"
              min={0}
              value={formData.defaultPrice}
              onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm-min">Minimum qoldiq</Label>
            <Input
              id="rm-min"
              type="number"
              min={0}
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm-desc">Izoh</Label>
            <Textarea
              id="rm-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ixtiyoriy"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
