import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Supplier } from "@/services/suppliers.service";
import { createSupplier, updateSupplier } from "@/services/suppliers.service";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierDialog({ open, onOpenChange, supplier, onSuccess }: SupplierDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [inn, setInn] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setPhone(supplier.phone);
      setAddress(supplier.address || "");
      setInn(supplier.inn || "");
      setNote(supplier.note || "");
    } else {
      setName("");
      setPhone("");
      setAddress("");
      setInn("");
      setNote("");
    }
    setErrors({});
  }, [supplier, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nomi majburiy";
    if (!phone.trim()) newErrors.phone = "Telefon majburiy";
    else if (phone.trim().length < 7) newErrors.phone = "Telefon kamida 7 ta belgi bo'lishi kerak";
    if (inn && inn.length > 12) newErrors.inn = "INN 12 ta belgidan ko'p bo'lmasligi kerak";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        inn: inn.trim() || undefined,
        note: note.trim() || undefined,
      };

      if (supplier) {
        await updateSupplier(supplier.id, payload);
        toast.success("Ta'minotchi tahrirlandi");
      } else {
        await createSupplier(payload);
        toast.success("Ta'minotchi qo'shildi");
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Ta'minotchini tahrirlash" : "Ta'minotchi qo'shish"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Ta'minotchi ma'lumotlarini o'zgartiring"
              : "Yangi ta'minotchi qo'shing"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nomi <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ta'minotchi nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Telefon <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Manzil</label>
            <Input
              placeholder="Shahar, ko'cha, uy raqami"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">INN</label>
            <Input
              placeholder="Soliq ID raqami"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              maxLength={12}
              className={errors.inn ? "border-red-500" : ""}
            />
            {errors.inn && <p className="text-red-500 text-xs mt-1">{errors.inn}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <Textarea
              placeholder="Qo'shimcha ma'lumot..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saqlanmoqda..." : supplier ? "Saqlash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
