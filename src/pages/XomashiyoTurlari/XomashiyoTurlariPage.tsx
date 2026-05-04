import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RawMaterialTable } from "./components/RawMaterialTable";
import { RawMaterialFilters } from "./components/RawMaterialFilters";
import { RawMaterialModal } from "./components/RawMaterialModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { rawMaterials as seedRawMaterials } from "@/lib/mockData";
import type { RawMaterial, RawMaterialFilter, ModalMode } from "./types";

const mapSeedRawMaterials = (): RawMaterial[] =>
  seedRawMaterials.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    type: item.branch.toUpperCase() as 'ICH' | 'WL',
    unit: item.unit as 'kg' | 'litre' | 'dona',
    defaultPrice: parseInt(item.price.replace(/\s/g, '')),
    minStock: item.min,
    description: "",
    createdAt: new Date().toISOString().slice(0, 10),
  }));

export default function XomashiyoTurlariPage() {
  const { toast } = useToast();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [filter, setFilter] = useState<RawMaterialFilter>({ search: '', type: 'ALL' });
  const [isLoading, setIsLoading] = useState(true);

  // Modal holatlari:
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);

  // O'chirish holati:
  const [deletingItem, setDeletingItem] = useState<RawMaterial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered list (useMemo):
  const filteredMaterials = useMemo(() => {
    return rawMaterials
      .filter(rm => filter.type === 'ALL' || rm.type === filter.type)
      .filter(rm => rm.name.toLowerCase().includes(filter.search.toLowerCase()));
  }, [rawMaterials, filter]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRawMaterials(mapSeedRawMaterials());
      setIsLoading(false);
    }, 500);
  }, []);

  // Qo'shish modal ochish:
  const handleAdd = () => {
    setModalMode('add');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Tahrirlash modal ochish:
  const handleEdit = (item: RawMaterial) => {
    setModalMode('edit');
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // O'chirish dialog ochish:
  const handleDeleteClick = (item: RawMaterial) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = (item: RawMaterial) => {
    if (modalMode === 'add') {
      setRawMaterials(prev => [...prev, item]);
      toast({
        title: "Muvaffaqiyat",
        description: "Yangi xomashiyo qo'shildi",
      });
    } else {
      setRawMaterials(prev => prev.map(rm => rm.id === item.id ? item : rm));
      toast({
        title: "Muvaffaqiyat",
        description: "Xomashiyo tahrirlandi",
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Check if can delete (simulate)
      if (Math.random() > 0.5) { // Random for demo
        throw new Error("Bu xomashiyo ishlatilmoqda, o'chirib bo'lmaydi");
      }
      setRawMaterials(prev => prev.filter(rm => rm.id !== deletingItem.id));
      toast({
        title: "Muvaffaqiyat",
        description: "Xomashiyo o'chirildi",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "O'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xomashiyo turlari"
        subtitle="ICH va WL xomashiyolari katalogi"
      />

      <RawMaterialFilters
        filter={filter}
        onFilterChange={setFilter}
        onAdd={handleAdd}
      />

      <RawMaterialTable
        materials={filteredMaterials}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <RawMaterialModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        itemName={deletingItem?.name || ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}