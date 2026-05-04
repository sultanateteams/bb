import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { SalesAgent, SalesAgentFormData } from "../types";

interface SalesAgentModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: SalesAgent | null;
  onClose: () => void;
  onSuccess: (agent: SalesAgent) => void;
}

const validateForm = (data: SalesAgentFormData): string[] => {
  const errors: string[] = [];
  if (!data.firstName.trim() || data.firstName.length < 2) errors.push("Ismi kamida 2 harf bo'lishi kerak");
  if (!data.lastName.trim() || data.lastName.length < 2) errors.push("Familiyasi kamida 2 harf bo'lishi kerak");
  if (!data.pinfl || data.pinfl.length !== 14 || !/^\d+$/.test(data.pinfl)) errors.push("PINFL aynan 14 ta raqam bo'lishi kerak");
  if (!data.phone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(data.phone)) errors.push("Telefon +998 XX XXX XX XX formatda bo'lishi kerak");
  if (!data.commissionRate || Number(data.commissionRate) < 0.1 || Number(data.commissionRate) > 100) errors.push("Foiz 0.1 dan 100 gacha bo'lishi kerak");
  return errors;
};

export function SalesAgentModal({ isOpen, mode, initialData, onClose, onSuccess }: SalesAgentModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SalesAgentFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    pinfl: '',
    phone: '',
    commissionRate: '',
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
          commissionRate: initialData.commissionRate.toString(),
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          pinfl: '',
          phone: '',
          commissionRate: '',
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

      const newAgent: SalesAgent = {
        id: mode === 'add' ? Date.now() : initialData!.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        pinfl: formData.pinfl,
        phone: formData.phone,
        commissionRate: Number(formData.commissionRate),
      };

      onSuccess(newAgent);
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
            {mode === 'add' ? "Agent qo'shish" : "Agentni tahrirlash"}
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
            <Label htmlFor="commissionRate">Foiz (%)</Label>
            <Input id="commissionRate" type="number" step="0.1" min="0.1" max="100" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })} />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p className="font-medium">Eslatma:</p>
            <p>Savdo vakili foizi buyurtma to'liq yetkazilgandan keyin hisoblanadi. Foiz hisobi: (Buyurtma summasi — 'Mijoz rad etdi' qaytarishlar) × Foiz %</p>
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