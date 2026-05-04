import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Dealer, DealerFormData } from "../types";

interface DealerModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: Dealer | null;
  onClose: () => void;
  onSuccess: (dealer: Dealer) => void;
}

const validateForm = (data: DealerFormData): string[] => {
  const errors: string[] = [];
  if (!data.firstName.trim() || data.firstName.length < 2) errors.push("Ismi kamida 2 harf bo'lishi kerak");
  if (!data.lastName.trim() || data.lastName.length < 2) errors.push("Familiyasi kamida 2 harf bo'lishi kerak");
  if (!data.pinfl || data.pinfl.length !== 14 || !/^\d+$/.test(data.pinfl)) errors.push("PINFL aynan 14 ta raqam bo'lishi kerak");
  if (!data.inn || !/^\d{9,}$/.test(data.inn)) errors.push("INN raqamlar bo'lishi va kamida 9 ta bo'lishi kerak");
  if (!data.region.trim()) errors.push("Region tanlanmagan");
  if (!data.district.trim()) errors.push("Tuman tanlanmagan");
  if (!data.address.trim()) errors.push("Manzil kiritilmagan");
  return errors;
};

const regions = ["Andijon", "Buxoro", "Farg'ona", "Jizzax", "Qashqadaryo", "Navoiy", "Samarqand", "Surxondaryo", "Sirdaryo", "Toshkent", "Tashkent City"];
const districts: Record<string, string[]> = {
  "Andijon": ["Andijon", "Asaka", "Baliqchi", "Izboskan"],
  "Buxoro": ["Buxoro", "Gijduvon", "Kogon"],
  "Farg'ona": ["Farg'ona", "Quvasuv", "Rishton"],
  "Toshkent": ["Tashkent", "Bektemir", "Chilanzar", "Mirobod", "Sergeli", "Shayhontohur", "Uchtepa", "Yunusobod", "Yangihayot", "Yashnobod"],
};

export function DealerModal({ isOpen, mode, initialData, onClose, onSuccess }: DealerModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DealerFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    pinfl: '',
    inn: '',
    region: '',
    district: '',
    street: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          middleName: initialData.middleName || '',
          pinfl: initialData.pinfl,
          inn: initialData.inn,
          region: initialData.region,
          district: initialData.district,
          street: initialData.street || '',
          address: initialData.address,
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          pinfl: '',
          inn: '',
          region: '',
          district: '',
          street: '',
          address: '',
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

      const newDealer: Dealer = {
        id: mode === 'add' ? Date.now() : initialData!.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        pinfl: formData.pinfl,
        inn: formData.inn,
        region: formData.region,
        district: formData.district,
        street: formData.street || undefined,
        address: formData.address,
      };

      onSuccess(newDealer);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? "Diler qo'shish" : "Dilerni tahrirlash"}
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
              <Label htmlFor="inn">INN</Label>
              <Input id="inn" value={formData.inn} onChange={(e) => setFormData({ ...formData, inn: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v, district: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Tuman</Label>
              <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {(districts[formData.region] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Ko'cha</Label>
            <Input id="street" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Manzil</Label>
            <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
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