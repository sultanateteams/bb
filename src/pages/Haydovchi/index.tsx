import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DriverTable } from "./components/DriverTable";
import { DriverModal } from "./components/DriverModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Driver } from "./types";
import { createDriver, deleteDriver, getDrivers, updateDriver } from "@/services/partners.service";

export function Haydovchi() { const { toast } = useToast(); const [drivers, setDrivers] = useState<Driver[]>([]); const [isModalOpen, setIsModalOpen] = useState(false); const [editingDriver, setEditingDriver] = useState<Driver | null>(null); const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null); const [isDeleteOpen, setIsDeleteOpen] = useState(false); const [isDeleting, setIsDeleting] = useState(false);
const load = async () => setDrivers(await getDrivers()); useEffect(() => { load(); }, []);
const handleModalSuccess = async (driver: Driver) => { try { if (editingDriver) { await updateDriver(driver.id, driver); toast({ title: "Muvaffaqiyat", description: "Haydovchi tahrirlandi" }); } else { await createDriver(driver); toast({ title: "Muvaffaqiyat", description: "Yangi haydovchi qo'shildi" }); } setIsModalOpen(false); await load(); } catch { toast({ title: "Xatolik", description: "Saqlashda xatolik", variant: "destructive" }); } };
const handleDeleteConfirm = async () => { if (!deletingDriver) return; setIsDeleting(true); try { await deleteDriver(deletingDriver.id); await load(); toast({ title: "Muvaffaqiyat", description: "Haydovchi o'chirildi" }); } catch { toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" }); } finally { setIsDeleting(false); setIsDeleteOpen(false); setDeletingDriver(null); } };
return <div className="space-y-6"><PageHeader title="Haydovchilar" subtitle="Yetkazib berish jamoasi (MVP 2 da buyurtmaga biriktiriladi)" showAdd addLabel="Haydovchi qo'shish" onAdd={() => { setEditingDriver(null); setIsModalOpen(true); }} /><DriverTable drivers={drivers} onEdit={(d) => { setEditingDriver(d); setIsModalOpen(true); }} onDelete={(d) => { setDeletingDriver(d); setIsDeleteOpen(true); }} /><DriverModal isOpen={isModalOpen} mode={editingDriver ? 'edit' : 'add'} initialData={editingDriver} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} /><DeleteConfirmDialog isOpen={isDeleteOpen} itemName={deletingDriver?.firstName || ''} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={() => setIsDeleteOpen(false)} /></div>; }
