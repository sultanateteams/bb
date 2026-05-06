import { useState } from "react";
import { useOmborStore, addSupplier } from "@/lib/omborStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface SupplierSelectProps {
  value: string | null;
  onChange: (supplierId: string | null) => void;
  required?: boolean;
  error?: string;
}

export function SupplierSelect({ value, onChange, required, error }: SupplierSelectProps) {
  const suppliers = useOmborStore((s) => s.suppliers);
  const [showAdd, setShowAdd] = useState(false);
  const [nomi, setNomi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [manzil, setManzil] = useState("");
  const [inn, setInn] = useState("");
  const [izoh, setIzoh] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const handleAddSave = () => {
    const errs: Record<string, string> = {};
    if (!nomi.trim()) errs.nomi = "Nomi majburiy";
    if (!telefon.trim()) errs.telefon = "Telefon majburiy";
    if (Object.keys(errs).length) { setAddErrors(errs); return; }

    const newSupplier = addSupplier({ nomi: nomi.trim(), telefon: telefon.trim(), manzil: manzil.trim() || undefined, inn: inn.trim() || undefined, izoh: izoh.trim() || undefined });
    onChange(newSupplier.id);
    toast.success(`${newSupplier.nomi} ta'minotchi qo'shildi`);
    setShowAdd(false);
    setNomi(""); setTelefon(""); setManzil(""); setInn(""); setIzoh(""); setAddErrors({});
  };

  return (
    <>
      <div className="space-y-1.5">
        <Label>Ta'minotchi {required && <span className="text-red-500">*</span>}</Label>
        <Select value={value || ""} onValueChange={(v) => v === "__add__" ? setShowAdd(true) : onChange(v || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Ta'minotchi tanlang" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nomi} — {s.telefon}
              </SelectItem>
            ))}
            <SelectItem value="__add__">
              <span className="flex items-center gap-1 text-primary">
                <Plus className="h-3 w-3" /> Yangi ta'minotchi qo'shish
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi ta'minotchi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nomi *</Label>
              <Input value={nomi} onChange={(e) => setNomi(e.target.value)} placeholder="Ta'minotchi nomi" />
              {addErrors.nomi && <p className="text-xs text-destructive mt-1">{addErrors.nomi}</p>}
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="+998 XX XXX XX XX" />
              {addErrors.telefon && <p className="text-xs text-destructive mt-1">{addErrors.telefon}</p>}
            </div>
            <div>
              <Label>Manzil</Label>
              <Input value={manzil} onChange={(e) => setManzil(e.target.value)} />
            </div>
            <div>
              <Label>INN</Label>
              <Input value={inn} onChange={(e) => setInn(e.target.value)} />
            </div>
            <div>
              <Label>Izoh</Label>
              <Input value={izoh} onChange={(e) => setIzoh(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Bekor qilish</Button>
            <Button onClick={handleAddSave}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
