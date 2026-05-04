import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Employee, EmployeeFormData } from "../types";

interface EmployeeModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: Employee | null;
  onClose: () => void;
  onSuccess: (employee: Employee) => void;
}

const validateForm = (data: EmployeeFormData): string[] => {
  const errors: string[] = [];
  if (!data.firstName.trim() || data.firstName.length < 2) errors.push("Ismi kamida 2 harf bo'lishi kerak");
  if (!data.lastName.trim() || data.lastName.length < 2) errors.push("Familiyasi kamida 2 harf bo'lishi kerak");
  if (!data.pinfl || data.pinfl.length !== 14 || !/^\d+$/.test(data.pinfl)) errors.push("PINFL aynan 14 ta raqam bo'lishi kerak");
  if (!data.phone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(data.phone)) errors.push("Telefon +998 XX XXX XX XX formatda bo'lishi kerak");
  if (!data.position.trim() || data.position.length < 2) errors.push("Lavozimi kamida 2 harf bo'lishi kerak");
  if (data.systemLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.systemLogin)) errors.push("Email noto'g'ri formatda");
  return errors;
};

export function EmployeeModal({ isOpen, mode, initialData, onClose, onSuccess }: EmployeeModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    pinfl: '',
    phone: '',
    position: '',
    systemLogin: '',
    role: '',
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
          position: initialData.position,
          systemLogin: initialData.systemLogin || '',
          role: initialData.role || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          pinfl: '',
          phone: '',
          position: '',
          systemLogin: '',
          role: '',
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

      const newEmployee: Employee = {
        id: mode === 'add' ? Date.now() : initialData!.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        pinfl: formData.pinfl,
        phone: formData.phone,
        position: formData.position,
        systemLogin: formData.systemLogin || undefined,
        role: formData.role || undefined,
      };

      onSuccess(newEmployee);
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

  const showRoleField = formData.systemLogin.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? "Hodim qo'shish" : "Hodimni tahrirlash"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ismi</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Ismi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Familiyasi</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Familiyasi"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Sharifi</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              placeholder="Sharifi (ixtiyoriy)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pinfl">PINFL</Label>
              <Input
                id="pinfl"
                value={formData.pinfl}
                onChange={(e) => setFormData({ ...formData, pinfl: e.target.value.replace(/\D/g, '').slice(0, 14) })}
                placeholder="14 raqam"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 XX XXX XX XX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Lavozimi</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Lavozimi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemLogin">Tizim login (email)</Label>
            <Input
              id="systemLogin"
              type="email"
              value={formData.systemLogin}
              onChange={(e) => setFormData({ ...formData, systemLogin: e.target.value })}
              placeholder="email@domain.com (ixtiyoriy)"
            />
          </div>
          {showRoleField && (
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'Admin' | 'Operator' | '') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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