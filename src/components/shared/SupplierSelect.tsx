import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, createSupplier } from "@/services/suppliers.service";
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
  const qc = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers({ is_active: true }),
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (newSupplier) => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      if (newSupplier) onChange(String(newSupplier.id));
      toast.success(`${newSupplier?.name} ta'minotchi qo'shildi`);
      setShowAdd(false);
      setName(""); setPhone(""); setAddress(""); setInn(""); setNote(""); setAddErrors({});
    },
    onError: () => toast.error("Ta'minotchi qo'shishda xatolik"),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [inn, setInn] = useState("");
  const [note, setNote] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const handleAddSave = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nomi majburiy";
    if (!phone.trim()) errs.phone = "Telefon majburiy";
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    createMutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      inn: inn.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <>
      <div className="space-y-1.5">
        <Label>Ta'minotchi {required && <span className="text-red-500">*</span>}</Label>
        <Select
          value={value || ""}
          onValueChange={(v) => (v === "__add__" ? setShowAdd(true) : onChange(v || null))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ta'minotchi tanlang" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name} — {s.phone}
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ta'minotchi nomi" />
              {addErrors.name && <p className="text-xs text-destructive mt-1">{addErrors.name}</p>}
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 XX XXX XX XX" />
              {addErrors.phone && <p className="text-xs text-destructive mt-1">{addErrors.phone}</p>}
            </div>
            <div>
              <Label>Manzil</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label>INN</Label>
              <Input value={inn} onChange={(e) => setInn(e.target.value)} />
            </div>
            <div>
              <Label>Izoh</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Bekor qilish</Button>
            <Button onClick={handleAddSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
