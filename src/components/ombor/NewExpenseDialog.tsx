import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOmborStore, addNewExpense, type AddExpenseInput } from "@/lib/omborStore";
import { todayUz } from "@/lib/utils";

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewExpenseDialog({ open, onOpenChange }: NewExpenseDialogProps) {
  const expenseTypes = useOmborStore((s) => s.expenseTypes);

  const [date, setDate] = useState(todayUz());
  const [typeId, setTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const users = ["Admin", "Operator"];
  const [createdBy, setCreatedBy] = useState("Admin");

  const handleSave = async () => {
    if (!typeId || !amount || !description) return;

    setLoading(true);
    try {
      const input: AddExpenseInput = {
        typeId: parseInt(typeId),
        amount: parseFloat(amount.replace(/\s/g, "")),
        description,
        createdBy,
        date,
      };

      addNewExpense(input);

      setTimeout(() => {
        onOpenChange(false);
        // Reset form
        setDate(todayUz());
        setTypeId("");
        setAmount("");
        setDescription("");
        setCreatedBy("Admin");
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error adding expense:", error);
      setLoading(false);
    }
  };

  // Filter out automatic types for manual entry
  const manualTypes = expenseTypes.filter((t) => !t.isAutomatic);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chiqim qo'shish</DialogTitle>
          <DialogDescription>Manually add a new expense record</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Sana</Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Chiqim turi</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {manualTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Summasi (so'm)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              placeholder="Nima uchun, kimga, qanday maqsadda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Created By */}
          <div className="space-y-2">
            <Label htmlFor="createdBy">Rasmiylashtrirgan</Label>
            <Select value={createdBy} onValueChange={setCreatedBy}>
              <SelectTrigger id="createdBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button disabled={!typeId || !amount || !description || loading} onClick={handleSave}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
