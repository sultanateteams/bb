import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeModal } from "./components/EmployeeModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "./types";
import { queryClient } from "@/lib/query-client";
import { useApiMutation, useApiQuery } from "@/hooks/use-api-query";

export function CEO() {
  const { toast } = useToast();

  // 1. Ma'lumotlarni API'dan olish (GET)
  const { data: apiResponse, isLoading } = useApiQuery<Employee[]>(
    ["employees"],
    "/users", // Backend endpointingiz
  );

  // API response ichidagi resultni olish
  const employees = apiResponse?.result || [];

  // 2. Ma'lumot qo'shish/tahrirlash uchun Mutation
  const { mutate: upsertEmployee } = useApiMutation<Employee, any>(
    "post",
    "/site/employees",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        setIsModalOpen(false);
        toast({ title: "Muvaffaqiyat", description: "Ma'lumotlar saqlandi" });
      },
    },
  );

  // 3. Ma'lumot o'chirish uchun Mutation
  const { mutate: deleteEmployee, isPending: isDeleting } = useApiMutation<
    any,
    any
  >(
    "delete",
    "/site/employees", // Odatda /employees/:id bo'ladi, API'ga qarab moslang
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        setIsDeleteDialogOpen(false);
        toast({ title: "Muvaffaqiyat", description: "Hodim o'chirildi" });
      },
    },
  );

  // Modal states
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Delete states
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    // API'ga yuborish (Add yoki Edit uchun bitta endpoint yoki shart qo'shish mumkin)
    upsertEmployee(formData);
  };

  const handleDeleteConfirm = () => {
    if (!deletingEmployee) return;
    deleteEmployee({ id: deletingEmployee.id });
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
