import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeModal } from "./components/EmployeeModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "./types";
import {
  useEmployeesQuery,
  useUpsertEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/hooks/api/employee.hooks";

export function CEO() {
  const { toast } = useToast();

  // ── Data fetching ──────────────────────────────────────────────
  const { data: apiResponse, isLoading } = useEmployeesQuery();
  const employees = apiResponse?.result || [];

  // ── Mutations ──────────────────────────────────────────────────
  const { mutate: upsertEmployee, isPending: isUpserting } =
    useUpsertEmployeeMutation();
  const { mutate: deleteEmployee, isPending: isDeleting } =
    useDeleteEmployeeMutation();

  // ── Modal states ───────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // ── Delete states ──────────────────────────────────────────────
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────
  const handleAdd = () => {
    setModalMode("add");
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setModalMode("edit");
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = (formData: any) => {
    upsertEmployee(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        toast({
          title: "Muvaffaqiyat",
          description: "Ma'lumotlar saqlandi",
        });
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingEmployee) return;
    deleteEmployee(
      { id: deletingEmployee.id },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast({
            title: "Muvaffaqiyat",
            description: "Hodim o'chirildi",
          });
        },
      },
    );
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

      {isLoading ? (
        <div>Yuklanmoqda...</div>
      ) : (
        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

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