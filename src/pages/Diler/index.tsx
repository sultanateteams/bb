import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DealerTable } from "./components/DealerTable";
import { DealerModal } from "./components/DealerModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Dealer } from "./types";

const mockDealers: Dealer[] = [
  {
    id: 1,
    firstName: "Abdulla",
    lastName: "Karimov",
    middleName: "Abdullaevich",
    pinfl: "12345678901234",
    inn: "100123456",
    region: "Toshkent",
    district: "Tashkent",
    street: "Buyuk ipak yo'li",
    address: "Mustaqillik ko'chasi, 5, Toshkent shahar",
  },
  {
    id: 2,
    firstName: "Ali",
    lastName: "Usmonov",
    middleName: "Madina",
    pinfl: "23456789012345",
    inn: "100234567",
    region: "Samarqand",
    district: "Samarqand",
    street: "Registon ko'chasi",
    address: "Samarqand shahar, Registon ko'chasi 10",
  },
];

export function Diler() {
  const { toast } = useToast();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTimeout(() => setDealers(mockDealers), 500);
  }, []);

  const handleAdd = () => {
    setEditingDealer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (dealer: Dealer) => {
    setDeletingDealer(dealer);
    setIsDeleteOpen(true);
  };

  const handleModalSuccess = (dealer: Dealer) => {
    if (editingDealer) {
      setDealers(prev => prev.map(d => d.id === dealer.id ? dealer : d));
      toast({ title: "Muvaffaqiyat", description: "Diler tahrirlandi" });
    } else {
      setDealers(prev => [...prev, dealer]);
      toast({ title: "Muvaffaqiyat", description: "Yangi diler qo'shildi" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDealer) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDealers(prev => prev.filter(d => d.id !== deletingDealer.id));
      toast({ title: "Muvaffaqiyat", description: "Diler o'chirildi" });
    } catch (error) {
      toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingDealer(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dilerlar"
        subtitle="Distribyutorlar katalogi"
        showAdd
        addLabel="Diler qo'shish"
        onAdd={handleAdd}
      />

      <DealerTable dealers={dealers} onEdit={handleEdit} onDelete={handleDeleteClick} />

      <DealerModal
        isOpen={isModalOpen}
        mode={editingDealer ? 'edit' : 'add'}
        initialData={editingDealer}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        itemName={deletingDealer?.firstName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}