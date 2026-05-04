import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DriverTable } from "./components/DriverTable";
import { DriverModal } from "./components/DriverModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Driver } from "./types";

const mockDrivers: Driver[] = [
  {
    id: 1,
    firstName: "Olimov",
    lastName: "Shoxrux",
    middleName: "Qahramon",
    pinfl: "12345678901234",
    phone: "+998 90 555 66 77",
    carPlate: "01 A 123 BB",
  },
  {
    id: 2,
    firstName: "Qosimov",
    lastName: "Farrux",
    middleName: "Oqiljon",
    pinfl: "23456789012345",
    phone: "+998 91 666 77 88",
    carPlate: "01 B 456 CC",
  },
  {
    id: 3,
    firstName: "Norqulov",
    lastName: "Tulkin",
    pinfl: "34567890123456",
    phone: "+998 93 777 88 99",
    carPlate: "10 K 789 DD",
  },
];

export function Haydovchi() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTimeout(() => setDrivers(mockDrivers), 500);
  }, []);

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (driver: Driver) => {
    setDeletingDriver(driver);
    setIsDeleteOpen(true);
  };

  const handleModalSuccess = (driver: Driver) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
      toast({ title: "Muvaffaqiyat", description: "Haydovchi tahrirlandi" });
    } else {
      setDrivers(prev => [...prev, driver]);
      toast({ title: "Muvaffaqiyat", description: "Yangi haydovchi qo'shildi" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDriver) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDrivers(prev => prev.filter(d => d.id !== deletingDriver.id));
      toast({ title: "Muvaffaqiyat", description: "Haydovchi o'chirildi" });
    } catch (error) {
      toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingDriver(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Haydovchilar"
        subtitle="Yetkazib berish jamoasi (MVP 2 da buyurtmaga biriktiriladi)"
        showAdd
        addLabel="Haydovchi qo'shish"
        onAdd={handleAdd}
      />

      <DriverTable drivers={drivers} onEdit={handleEdit} onDelete={handleDeleteClick} />

      <DriverModal
        isOpen={isModalOpen}
        mode={editingDriver ? 'edit' : 'add'}
        initialData={editingDriver}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        itemName={deletingDriver?.firstName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}