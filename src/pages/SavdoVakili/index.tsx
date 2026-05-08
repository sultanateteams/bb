import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesAgentTable } from "./components/SalesAgentTable";
import { SalesAgentModal } from "./components/SalesAgentModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { SalesAgent } from "./types";
import { createAgent, deleteAgent, getAgents, updateAgent } from "@/services/partners.service";

export function SavdoVakili() { const { toast } = useToast(); const [agents, setAgents] = useState<SalesAgent[]>([]); const [isModalOpen, setIsModalOpen] = useState(false); const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null); const [deletingAgent, setDeletingAgent] = useState<SalesAgent | null>(null); const [isDeleteOpen, setIsDeleteOpen] = useState(false); const [isDeleting, setIsDeleting] = useState(false);
const load = async () => setAgents(await getAgents()); useEffect(() => { load(); }, []);
const handleModalSuccess = async (agent: SalesAgent) => { try { if (editingAgent) { await updateAgent(agent.id, agent); toast({ title: "Muvaffaqiyat", description: "Agent tahrirlandi" }); } else { await createAgent(agent); toast({ title: "Muvaffaqiyat", description: "Yangi agent qo'shildi" }); } setIsModalOpen(false); await load(); } catch { toast({ title: "Xatolik", description: "Saqlashda xatolik", variant: "destructive" }); } };
const handleDeleteConfirm = async () => { if (!deletingAgent) return; setIsDeleting(true); try { await deleteAgent(deletingAgent.id); await load(); toast({ title: "Muvaffaqiyat", description: "Agent o'chirildi" }); } catch { toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" }); } finally { setIsDeleting(false); setIsDeleteOpen(false); setDeletingAgent(null); } };
return <div className="space-y-6"><PageHeader title="Savdo vakillari" subtitle="Buyurtma olib keluvchi agentlar va ularning foizi" showAdd addLabel="Agent qo'shish" onAdd={() => { setEditingAgent(null); setIsModalOpen(true); }} /><SalesAgentTable agents={agents} onEdit={(a) => { setEditingAgent(a); setIsModalOpen(true); }} onDelete={(a) => { setDeletingAgent(a); setIsDeleteOpen(true); }} /><SalesAgentModal isOpen={isModalOpen} mode={editingAgent ? 'edit' : 'add'} initialData={editingAgent} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} /><DeleteConfirmDialog isOpen={isDeleteOpen} itemName={deletingAgent?.firstName || ''} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={() => setIsDeleteOpen(false)} /></div>; }
