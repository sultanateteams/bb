import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreTable } from "./components/StoreTable";
import { StoreModal } from "./components/StoreModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Store } from "./types";

const mockStores: Store[] = [
  {
    id: 1,
    storeName: "Olma Market",
    ownerFirstName: "Karimov",
    ownerLastName: "Abdullo",
    pinfl: "12345678901234",
    inn: "100123456",
    phone: "+998 90 100 20 30",
    category: "Retail",
    region: "Toshkent",
    district: "Tashkent",
    address: "Mustaqillik ko'chasi, 5, Toshkent shahar",
    geoLocation: "41.2995° N, 69.2401° E",
  },
  {
    id: 2,
    storeName: "Hilola Savdo",
    ownerFirstName: "Yusupova",
    ownerLastName: "Madina",
    pinfl: "23456789012345",
    inn: "100234567",
    phone: "+998 91 234 56 78",
    category: "Diler",
    region: "Samarqand",
    district: "Samarqand",
    address: "Samarqand shahar, Registon ko'chasi 10",
  },
];

export function Dokon() {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTimeout(() => setStores(mockStores), 500);
  }, []);

  const handleAdd = () => {
    setEditingStore(null);
    setIsModalOpen(true);
  };

  const handleViewDetail = (store: Store) => {
    toast({ title: "Info", description: `${store.storeName} - batafsil sahifa MVP 2.0 uchun`, variant: "default" });
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (store: Store) => {
    setDeletingStore(store);
    setIsDeleteOpen(true);
  };

  const handleModalSuccess = (store: Store) => {
    if (editingStore) {
      setStores(prev => prev.map(s => s.id === store.id ? store : s));
      toast({ title: "Muvaffaqiyat", description: "Do'kon tahrirlandi" });
    } else {
      setStores(prev => [...prev, store]);
      toast({ title: "Muvaffaqiyat", description: "Yangi do'kon qo'shildi" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStores(prev => prev.filter(s => s.id !== deletingStore.id));
      toast({ title: "Muvaffaqiyat", description: "Do'kon o'chirildi" });
    } catch (error) {
      toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingStore(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Do'konlar"
        subtitle="Buyurtmachi do'konlar — kategoriya narxlash tizimini belgilaydi"
        showAdd
        addLabel="Do'kon qo'shish"
        onAdd={handleAdd}
      />

      <StoreTable stores={stores} onViewDetail={handleViewDetail} onEdit={handleEdit} onDelete={handleDeleteClick} />

      <StoreModal
        isOpen={isModalOpen}
        mode={editingStore ? 'edit' : 'add'}
        initialData={editingStore}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        itemName={deletingStore?.storeName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}