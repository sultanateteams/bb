import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeModal } from "./components/EmployeeModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "./types";

// Mock data for employees
const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: "Karimov",
    lastName: "Abdulla",
    middleName: "Abdullaevich",
    pinfl: "12345678901234",
    phone: "+998 90 100 20 30",
    position: "Direktor",
    systemLogin: "admin@biznes.uz",
    role: "Admin",
  },
  {
    id: 2,
    firstName: "Olimova",
    lastName: "Madina",
    pinfl: "23456789012345",
    phone: "+998 91 200 30 40",
    position: "Operator",
    systemLogin: "operator1@biznes.uz",
    role: "Operator",
  },
  {
    id: 3,
    firstName: "Yusupov",
    lastName: "Bakir",
    pinfl: "34567890123456",
    phone: "+998 93 300 40 50",
    position: "Operator",
    systemLogin: "operator2@biznes.uz",
    role: "Operator",
  },
];

export function CEO() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Delete states
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleAdd = () => {
    setModalMode('add');
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setModalMode('edit');
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = (employee: Employee) => {
    if (modalMode === 'add') {
      setEmployees(prev => [...prev, employee]);
      toast({
        title: "Muvaffaqiyat",
        description: "Yangi hodim qo'shildi",
      });
    } else {
      setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
      toast({
        title: "Muvaffaqiyat",
        description: "Hodim tahrirlandi",
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmployees(prev => prev.filter(e => e.id !== deletingEmployee.id));
      toast({
        title: "Muvaffaqiyat",
        description: "Hodim o'chirildi",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "O'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CEO — Hodimlar"
        subtitle="Tizim foydalanuvchilari (Admin va Operator)"
        showAdd
        addLabel="Hodim qo'shish"
        onAdd={handleAdd}
      />

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <EmployeeModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingEmployee}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        employee={deletingEmployee}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}