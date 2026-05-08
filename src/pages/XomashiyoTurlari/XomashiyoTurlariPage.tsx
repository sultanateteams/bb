import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RawMaterialTable } from "./components/RawMaterialTable";
import { RawMaterialFilters } from "./components/RawMaterialFilters";
import { RawMaterialModal } from "./components/RawMaterialModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import {
  getRawMaterialTypes,
  createRawMaterialType,
  updateRawMaterialType,
  deleteRawMaterialType,
} from "@/services/raw-material-types.service";
import type { RawMaterial, RawMaterialFilter, ModalMode } from "./types";

export default function XomashiyoTurlariPage() {
  const { toast } = useToast();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [filter, setFilter] = useState<RawMaterialFilter>({ search: "", type: "ALL" });
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItem, setDeletingItem] = useState<RawMaterial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMaterials = useMemo(
    () =>
      rawMaterials
        .filter((rm) => filter.type === "ALL" || rm.type === filter.type)
        .filter((rm) => rm.name.toLowerCase().includes(filter.search.toLowerCase())),
    [rawMaterials, filter],
  );

  const load = async () => {
    setIsLoading(true);
    try {
      setRawMaterials(await getRawMaterialTypes());
    } catch {
      toast({ title: "Xatolik", description: "Xomashiyolar yuklanmadi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = () => {
    setModalMode("add");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: RawMaterial) => {
    setModalMode("edit");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: RawMaterial) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = async (item: RawMaterial) => {
    setIsSaving(true);
    try {
      if (modalMode === "edit" && editingItem) {
        const updated = await updateRawMaterialType(editingItem.id, item);
        setRawMaterials((prev) => prev.map((rm) => (rm.id === updated.id ? updated : rm)));
        toast({ title: "Muvaffaqiyat", description: "Xomashiyo tahrirlandi" });
      } else {
        const created = await createRawMaterialType(item);
        setRawMaterials((prev) => [created, ...prev]);
        toast({ title: "Muvaffaqiyat", description: "Yangi xomashiyo qo'shildi" });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast({
        title: "Xatolik",
        description: err?.message || "Saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteRawMaterialType(deletingItem.id);
      setRawMaterials((prev) => prev.filter((rm) => rm.id !== deletingItem.id));
      toast({ title: "Muvaffaqiyat", description: "Xomashiyo o'chirildi" });
    } catch (err: any) {
      toast({
        title: "Xatolik",
        description: err?.message || "O'chirishda xatolik yuz berdi",
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
      <PageHeader title="Xomashiyo turlari" subtitle="ICH va WL xomashiyolari katalogi" />

      <RawMaterialFilters filter={filter} onFilterChange={setFilter} onAdd={handleAdd} />

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
        isSaving={isSaving}
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
