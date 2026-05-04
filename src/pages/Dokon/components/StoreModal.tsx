import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Store, StoreFormData } from "../types";

interface StoreModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: Store | null;
  onClose: () => void;
  onSuccess: (store: Store) => void;
}

const validateForm = (data: StoreFormData): string[] => {
  const errors: string[] = [];
  if (!data.storeName.trim() || data.storeName.length < 2) errors.push("Do'kon nomi kamida 2 harf bo'lishi kerak");
  if (!data.ownerFirstName.trim() || data.ownerFirstName.length < 2) errors.push("Egasi ismi kamida 2 harf bo'lishi kerak");
  if (!data.ownerLastName.trim() || data.ownerLastName.length < 2) errors.push("Familiyasi kamida 2 harf bo'lishi kerak");
  if (!data.pinfl || data.pinfl.length !== 14 || !/^\d+$/.test(data.pinfl)) errors.push("PINFL aynan 14 ta raqam bo'lishi kerak");
  if (!data.inn || !/^\d+$/.test(data.inn)) errors.push("INN raqamlar bo'lishi kerak");
  if (!data.phone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(data.phone)) errors.push("Telefon +998 XX XXX XX XX formatda bo'lishi kerak");
  if (!data.category) errors.push("Kategoriya tanlanmagan");
  if (!data.region.trim()) errors.push("Region tanlanmagan");
  if (!data.district.trim()) errors.push("Tuman tanlanmagan");
  if (!data.address.trim()) errors.push("Manzil kiritilmagan");
  return errors;
};

const regions = ["Andijon", "Buxoro", "Farg'ona", "Jizzax", "Qashqadaryo", "Navoiy", "Samarqand", "Surxondaryo", "Sirdaryo", "Toshkent"];
const districts: Record<string, string[]> = {
  "Toshkent": ["Tashkent", "Bektemir", "Chilanzar", "Mirobod", "Sergeli", "Shayhontohur", "Uchtepa", "Yunusobod"],
  "Andijon": ["Andijon", "Asaka", "Baliqchi"],
};

export function StoreModal({ isOpen, mode, initialData, onClose, onSuccess }: StoreModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: '',
    ownerFirstName: '',
    ownerLastName: '',
    pinfl: '',
    inn: '',
    phone: '',
    category: '',
    region: '',
    district: '',
    address: '',
    geoLocation: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          storeName: initialData.storeName,
          ownerFirstName: initialData.ownerFirstName,
          ownerLastName: initialData.ownerLastName,
          pinfl: initialData.pinfl,
          inn: initialData.inn,
          phone: initialData.phone,
          category: initialData.category,
          region: initialData.region,
          district: initialData.district,
          address: initialData.address,
          geoLocation: initialData.geoLocation || '',
        });
      } else {
        setFormData({
          storeName: '',
          ownerFirstName: '',
          ownerLastName: '',
          pinfl: '',
          inn: '',
          phone: '',
          category: '',
          region: '',
          district: '',
          address: '',
          geoLocation: '',
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

      const newStore: Store = {
        id: mode === 'add' ? Date.now() : initialData!.id,
        storeName: formData.storeName,
        ownerFirstName: formData.ownerFirstName,
        ownerLastName: formData.ownerLastName,
        pinfl: formData.pinfl,
        inn: formData.inn,
        phone: formData.phone,
        category: formData.category as 'Retail' | 'Diler' | 'VIP',
        region: formData.region,
        district: formData.district,
        address: formData.address,
        geoLocation: formData.geoLocation || undefined,
      };

      onSuccess(newStore);
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
            {mode === 'add' ? "Do'kon qo'shish" : "Do'konni tahrirlash"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Do'kon nomi</Label>
            <Input id="storeName" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerFirstName">Egasi ismi</Label>
              <Input id="ownerFirstName" value={formData.ownerFirstName} onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerLastName">Familiyasi</Label>
              <Input id="ownerLastName" value={formData.ownerLastName} onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategoriya</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Diler">Diler</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+998 XX XXX XX XX" />
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
            <Label htmlFor="address">Manzil</Label>
            <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geoLocation">Geo-lokatsiya (ixtiyoriy)</Label>
            <Input id="geoLocation" value={formData.geoLocation} onChange={(e) => setFormData({ ...formData, geoLocation: e.target.value })} placeholder="Masalan: 41.2995° N, 69.2401° E" />
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