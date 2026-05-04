import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Driver, DriverFormData } from "../types";

interface DriverModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: Driver | null;
  onClose: () => void;
  onSuccess: (driver: Driver) => void;
}

const validateForm = (data: DriverFormData): string[] => {
  const errors: string[] = [];
  if (!data.firstName.trim() || data.firstName.length < 2) errors.push("Ismi kamida 2 harf bo'lishi kerak");
  if (!data.lastName.trim() || data.lastName.length < 2) errors.push("Familiyasi kamida 2 harf bo'lishi kerak");
  if (!data.pinfl || data.pinfl.length !== 14 || !/^\d+$/.test(data.pinfl)) errors.push("PINFL aynan 14 ta raqam bo'lishi kerak");
  if (!data.phone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(data.phone)) errors.push("Telefon +998 XX XXX XX XX formatda bo'lishi kerak");
  if (!data.carPlate.trim()) errors.push("Mashina raqami kiritilmagan");
  return errors;
};

export function DriverModal({ isOpen, mode, initialData, onClose, onSuccess }: DriverModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DriverFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    pinfl: '',
    phone: '',
    carPlate: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          middleName: initialData.middleName || '',
          pinfl: initialData.pinfl,
          phone: initialData.phone,
          carPlate: initialData.carPlate,
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          pinfl: '',
          phone: '',
          carPlate: '',
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newDriver: Driver = {
        id: mode === 'add' ? Date.now() : initialData!.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        pinfl: formData.pinfl,
        phone: formData.phone,
        carPlate: formData.carPlate,
      };

      onSuccess(newDriver);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? "Haydovchi qo'shish" : "Haydovchini tahrirlash"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ismi</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Familiyasi</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Sharifi</Label>
              <Input id="middleName" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pinfl">PINFL</Label>
              <Input id="pinfl" value={formData.pinfl} onChange={(e) => setFormData({ ...formData, pinfl: e.target.value.replace(/\D/g, '').slice(0, 14) })} maxLength={14} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+998 XX XXX XX XX" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="carPlate">Mashina raqami</Label>
            <Input id="carPlate" value={formData.carPlate} onChange={(e) => setFormData({ ...formData, carPlate: e.target.value })} placeholder="Masalan: 01 A 123 BB" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p className="font-medium">Eslatma:</p>
            <p>MVP 1.0 da haydovchilar faqat katalog sifatida saqlanadi. MVP 2.0 da buyurtma yetkazilishiga haydovchi biriktiriladi.</p>
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