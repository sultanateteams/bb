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
import { useOmborStore, addSupplier, updateSupplier } from "@/lib/omborStore";
import { toast } from "sonner";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
}

export function SupplierDialog({ open, onOpenChange, supplierId }: SupplierDialogProps) {
  const suppliers = useOmborStore((s) => s.suppliers);
  const [nomi, setNomi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [manzil, setManzil] = useState("");
  const [inn, setInn] = useState("");
  const [izoh, setIzoh] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supplier = supplierId ? suppliers.find((s) => s.id === supplierId) : null;

  useEffect(() => {
    if (supplier) {
      setNomi(supplier.nomi);
      setTelefon(supplier.telefon);
      setManzil(supplier.manzil || "");
      setInn(supplier.inn || "");
      setIzoh(supplier.izoh || "");
      setErrors({});
    } else {
      setNomi("");
      setTelefon("");
      setManzil("");
      setInn("");
      setIzoh("");
      setErrors({});
    }
  }, [supplier, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nomi.trim()) newErrors.nomi = "Nomi majburiy";
    if (!telefon.trim()) newErrors.telefon = "Telefon majburiy";
    if (inn && inn.length > 9) newErrors.inn = "INN 9 ta raqamdan ko'p bo'lishi mumkin emas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    try {
      if (supplier) {
        updateSupplier(supplier.id, {
          nomi,
          telefon,
          manzil: manzil || undefined,
          inn: inn || undefined,
          izoh: izoh || undefined,
        });
        toast.success("Ta'minotchi tahrirlandi");
      } else {
        addSupplier({
          nomi,
          telefon,
          manzil: manzil || undefined,
          inn: inn || undefined,
          izoh: izoh || undefined,
        });
        toast.success("Ta'minotchi qo'shildi");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
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
              value={nomi}
              onChange={(e) => setNomi(e.target.value)}
              className={errors.nomi ? "border-red-500" : ""}
            />
            {errors.nomi && <p className="text-red-500 text-xs mt-1">{errors.nomi}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Telefon <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="+998 90 123 45 67"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className={errors.telefon ? "border-red-500" : ""}
            />
            {errors.telefon && <p className="text-red-500 text-xs mt-1">{errors.telefon}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Manzil</label>
            <Input
              placeholder="Shahar, ko'cha, uy raqami"
              value={manzil}
              onChange={(e) => setManzil(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">INN</label>
            <Input
              placeholder="Soliq ID raqami"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              maxLength={9}
              className={errors.inn ? "border-red-500" : ""}
            />
            {errors.inn && <p className="text-red-500 text-xs mt-1">{errors.inn}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <Textarea
              placeholder="Qo'shimcha ma'lumot..."
              value={izoh}
              onChange={(e) => setIzoh(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit}>
            {supplier ? "Saqlash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
