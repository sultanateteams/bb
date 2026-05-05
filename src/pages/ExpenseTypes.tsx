import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useOmborStore, addExpenseType, updateExpenseType, deleteExpenseType } from "@/lib/omborStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Lock } from "lucide-react";

export default function ExpenseTypes() {
  const expenseTypes = useOmborStore((s) => s.expenseTypes);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const handleOpenDialog = (typeId?: number) => {
    if (typeId) {
      const type = expenseTypes.find((t) => t.id === typeId);
      if (type && !type.isAutomatic) {
        setEditingId(typeId);
        setFormName(type.name);
        setFormDescription(type.description || "");
      }
    } else {
      setEditingId(null);
      setFormName("");
      setFormDescription("");
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormName("");
    setFormDescription("");
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    if (editingId) {
      // Update logic
      updateExpenseType(editingId, formName, formDescription || undefined);
    } else {
      // Add new type logic
      addExpenseType(formName, formDescription || undefined);
    }

    handleCloseDialog();
  };

  const handleDelete = (typeId: number) => {
    if (confirm("Bu turni o'chirmoqchisiz?")) {
      deleteExpenseType(typeId);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Chiqim turlari boshqaruvi"
        subtitle="Avtomatik va qo'lda kiritiluvchi chiqim turlarini boshqarish"
      />

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Tur nomi</th>
                <th>Tavsif</th>
                <th className="w-32">Status</th>
                <th className="w-24">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {expenseTypes.map((type, index) => (
                <tr key={type.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="font-medium">{type.name}</td>
                  <td className="text-muted-foreground">{type.description || "—"}</td>
                  <td>
                    {type.isAutomatic ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
                        <Lock className="h-3 w-3" /> Avtomatik
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                        Qo'lda
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {!type.isAutomatic && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(type.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(type.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {type.isAutomatic && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-gradient-brand hover:opacity-90">
          <Plus className="h-4 w-4" /> Yangi tur qo'shish
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Turni tahrirlash" : "Yangi tur qo'shish"}</DialogTitle>
            <DialogDescription>
              {editingId ? "O'zgarishlarni saqlang" : "Yangi chiqim turini qo'shish"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tur nomi</Label>
              <Input
                id="name"
                placeholder="Masalan: Ijara, Yoqilg'i, va hokazo"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
              <Textarea
                id="description"
                placeholder="Qo'shimcha ma'lumot..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCloseDialog}>
              Bekor qilish
            </Button>
            <Button disabled={!formName.trim()} onClick={handleSave}>
              {editingId ? "Yangilash" : "Qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
