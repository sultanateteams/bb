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

export function RawMaterialModal({ isOpen, mode, initialData, onClose, onSuccess }: RawMaterialModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<RawMaterialFormData>({
    name: '',
    type: '',
    unit: '',
    defaultPrice: '',
    minStock: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          type: initialData.type,
          unit: initialData.unit,
          defaultPrice: initialData.defaultPrice.toString(),
          minStock: initialData.minStock.toString(),
          description: initialData.description || '',
        });
      } else {
        setFormData({
          name: '',
          type: '',
          unit: '',
          defaultPrice: '',
          minStock: '',
          description: '',
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast({
        title: "Xatolik",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newItem: RawMaterial = {
        id: mode === 'add' ? Date.now().toString() : initialData!.id,
        name: formData.name,
        type: formData.type as 'ICH' | 'WL',
        unit: formData.unit as 'kg' | 'litre' | 'dona',
        defaultPrice: Number(formData.defaultPrice),
        minStock: Number(formData.minStock),
        description: formData.description,
        createdAt: mode === 'add' ? new Date().toISOString().slice(0, 10) : initialData!.createdAt,
      };

      onSuccess(newItem);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? "Yangi xomashiyo qo'shish" : "Xomashiyoni tahrirlash"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nomi</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Xomashiyo nomi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Turi</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
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
            <Label htmlFor="unit">O'lchov birligi</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
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
            <Label htmlFor="defaultPrice">Standart narxi (so'm)</Label>
            <Input
              id="defaultPrice"
              type="number"
              value={formData.defaultPrice}
              onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Minimum qoldiq</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Izoh</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ixtiyoriy"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
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