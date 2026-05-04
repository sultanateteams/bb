import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesAgentTable } from "./components/SalesAgentTable";
import { SalesAgentModal } from "./components/SalesAgentModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { SalesAgent } from "./types";

const mockAgents: SalesAgent[] = [
  {
    id: 1,
    firstName: "Karimov",
    lastName: "Baxrom",
    middleName: "Abdullaevich",
    pinfl: "12345678901234",
    phone: "+998 90 111 22 33",
    commissionRate: 3.5,
    activeOrders: 12,
  },
  {
    id: 2,
    firstName: "Yusupov",
    lastName: "Sardor",
    middleName: "Qudratovich",
    pinfl: "23456789012345",
    phone: "+998 91 222 33 44",
    commissionRate: 4.0,
    activeOrders: 8,
  },
  {
    id: 3,
    firstName: "Tursunov",
    lastName: "Mirza",
    pinfl: "34567890123456",
    phone: "+998 93 333 44 55",
    commissionRate: 3.0,
    activeOrders: 5,
  },
];

export function SavdoVakili() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<SalesAgent | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTimeout(() => setAgents(mockAgents), 500);
  }, []);

  const handleAdd = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (agent: SalesAgent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (agent: SalesAgent) => {
    setDeletingAgent(agent);
    setIsDeleteOpen(true);
  };

  const handleModalSuccess = (agent: SalesAgent) => {
    if (editingAgent) {
      setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
      toast({ title: "Muvaffaqiyat", description: "Agent tahrirlandi" });
    } else {
      setAgents(prev => [...prev, agent]);
      toast({ title: "Muvaffaqiyat", description: "Yangi agent qo'shildi" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAgent) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAgents(prev => prev.filter(a => a.id !== deletingAgent.id));
      toast({ title: "Muvaffaqiyat", description: "Agent o'chirildi" });
    } catch (error) {
      toast({ title: "Xatolik", description: "O'chirishda xatolik yuz berdi", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingAgent(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savdo vakillari"
        subtitle="Buyurtma olib keluvchi agentlar va ularning foizi"
        showAdd
        addLabel="Agent qo'shish"
        onAdd={handleAdd}
      />

      <SalesAgentTable agents={agents} onEdit={handleEdit} onDelete={handleDeleteClick} />

      <SalesAgentModal
        isOpen={isModalOpen}
        mode={editingAgent ? 'edit' : 'add'}
        initialData={editingAgent}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        itemName={deletingAgent?.firstName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}