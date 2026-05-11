import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { SupplierDialog } from "@/components/tamirotchilar/SupplierDialog";
import { toast } from "sonner";
import type { Supplier } from "@/services/suppliers.service";
import { getSuppliers, deleteSupplier } from "@/services/suppliers.service";

export function Tamirotchilar() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch {
      toast.error("Ta'minotchilarni yuklashda xatolik");
    }
  };

  useEffect(() => { load(); }, []);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.inn && s.inn.includes(search)),
  );

  return (
    <>
      <PageHeader
        title="Ta'minotchilar"
        subtitle="Xomashiyo va mahsulot ta'minotchilari"
        showExport
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Nomi yoki INN bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setShowDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Ta'minotchi qo'shish
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Nomi</th>
                <th className="px-4 py-3 text-left font-semibold">Telefon</th>
                <th className="px-4 py-3 text-left font-semibold">INN</th>
                <th className="px-4 py-3 text-left font-semibold">Umumiy kredit</th>
                <th className="px-4 py-3 text-left font-semibold">Oxirgi import</th>
                <th className="px-4 py-3 text-left font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier, idx) => (
                <tr key={supplier.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-gray-600">{supplier.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{supplier.inn || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">—</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tamirotchilar/${supplier.id}`)}
                        className="gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        Batafsil
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingSupplier(supplier); setShowDialog(true); }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="rounded-lg border border-dashed py-8 text-center text-gray-500">
            Hech qanday ta'minotchi topilmadi
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Dialog */}
      <SupplierDialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDialog(false);
            setEditingSupplier(null);
          }
        }}
        supplier={editingSupplier}
        onSuccess={load}
      />

      {/* Delete Confirmation Dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Ta'minotchini o'chirish</h2>
            <p className="mb-6 text-gray-600">
              Siz bu ta'minotchini o'chirmoka hohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await deleteSupplier(deleteId);
                    setDeleteId(null);
                    await load();
                    toast.success("Ta'minotchi o'chirildi");
                  } catch {
                    toast.error("O'chirishda xatolik yuz berdi");
                  }
                }}
              >
                O'chirish
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
