import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DealerTable } from "./components/DealerTable";
import { DealerModal } from "./components/DealerModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Dealer } from "./types";
import { createDealer, deleteDealer, getDealers, updateDealer } from "@/services/partners.service";

export function Diler() {
  const { toast } = useToast();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => setDealers(await getDealers());
  useEffect(() => { load(); }, []);
  const handleAdd = () => { setEditingDealer(null); setIsModalOpen(true); };
  const handleEdit = (dealer: Dealer) => { setEditingDealer(dealer); setIsModalOpen(true); };
  const handleDeleteClick = (dealer: Dealer) => { setDeletingDealer(dealer); setIsDeleteOpen(true); };

  const handleModalSuccess = async (dealer: Dealer) => {
    try {
      if (editingDealer) { await updateDealer(dealer.id, dealer); toast({ title: "Muvaffaqiyat", description: "Diler tahrirlandi" }); }
      else { await createDealer(dealer); toast({ title: "Muvaffaqiyat", description: "Yangi diler qo'shildi" }); }
      setIsModalOpen(false); await load();
    } catch { toast({ title: "Xatolik", description: "Saqlashda xatolik", variant: "destructive" }); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDealer) return;
    setIsDeleting(true);
    try { await deleteDealer(deletingDealer.id); await load(); toast({ title: "Muvaffaqiyat", description: "Diler o'chirildi" }); }
    catch { toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" }); }
    finally { setIsDeleting(false); setIsDeleteOpen(false); setDeletingDealer(null); }
  };

  return <div className="space-y-6"><PageHeader title="Dilerlar" subtitle="Distribyutorlar katalogi" showAdd addLabel="Diler qo'shish" onAdd={handleAdd} /><DealerTable dealers={dealers} onEdit={handleEdit} onDelete={handleDeleteClick} /><DealerModal isOpen={isModalOpen} mode={editingDealer ? 'edit' : 'add'} initialData={editingDealer} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} /><DeleteConfirmDialog isOpen={isDeleteOpen} itemName={deletingDealer?.firstName || ''} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={() => setIsDeleteOpen(false)} /></div>;
}
