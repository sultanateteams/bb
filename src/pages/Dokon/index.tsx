import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreTable } from "./components/StoreTable";
import { StoreModal } from "./components/StoreModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Store } from "./types";
import { createShop, deleteShop, getShops, updateShop } from "@/services/partners.service";

export function Dokon() { const { toast } = useToast(); const [stores, setStores] = useState<Store[]>([]); const [isModalOpen, setIsModalOpen] = useState(false); const [editingStore, setEditingStore] = useState<Store | null>(null); const [deletingStore, setDeletingStore] = useState<Store | null>(null); const [isDeleteOpen, setIsDeleteOpen] = useState(false); const [isDeleting, setIsDeleting] = useState(false);
const load = async () => setStores(await getShops()); useEffect(() => { load(); }, []);
const handleModalSuccess = async (store: Store) => { try { if (editingStore) { await updateShop(store.id, store); toast({ title: "Muvaffaqiyat", description: "Do'kon tahrirlandi" }); } else { await createShop(store); toast({ title: "Muvaffaqiyat", description: "Yangi do'kon qo'shildi" }); } setIsModalOpen(false); await load(); } catch { toast({ title: "Xatolik", description: "Saqlashda xatolik", variant: "destructive" }); } };
const handleDeleteConfirm = async () => { if (!deletingStore) return; setIsDeleting(true); try { await deleteShop(deletingStore.id); await load(); toast({ title: "Muvaffaqiyat", description: "Do'kon o'chirildi" }); } catch { toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" }); } finally { setIsDeleting(false); setIsDeleteOpen(false); setDeletingStore(null); } };
return <div className="space-y-6"><PageHeader title="Do'konlar" subtitle="Buyurtmachi do'konlar — kategoriya narxlash tizimini belgilaydi" showAdd addLabel="Do'kon qo'shish" onAdd={() => { setEditingStore(null); setIsModalOpen(true); }} /><StoreTable stores={stores} onViewDetail={(store) => toast({ title: "Info", description: `${store.storeName} - batafsil sahifa MVP 2.0 uchun`, variant: "default" })} onEdit={(s) => { setEditingStore(s); setIsModalOpen(true); }} onDelete={(s) => { setDeletingStore(s); setIsDeleteOpen(true); }} /><StoreModal isOpen={isModalOpen} mode={editingStore ? 'edit' : 'add'} initialData={editingStore} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} /><DeleteConfirmDialog isOpen={isDeleteOpen} itemName={deletingStore?.storeName || ''} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={() => setIsDeleteOpen(false)} /></div>; }
