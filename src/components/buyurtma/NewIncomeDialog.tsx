import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addNewIncome, type AddIncomeInput } from "@/lib/omborStore";
import { todayUz } from "@/lib/utils";

interface NewIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewIncomeDialog({ open, onOpenChange }: NewIncomeDialogProps) {
  const [date, setDate] = useState(todayUz());
  const [type, setType] = useState("order_payment");
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [receivedBy, setReceivedBy] = useState("Admin");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const users = ["Admin", "Operator"];
  const orders = ["B-2041", "B-2040", "B-2039", "B-2038"];

  const handleSave = async () => {
    if (!amount) return;

    setLoading(true);
    try {
      const input: AddIncomeInput = {
        type: type as "order_payment" | "scrap" | "other",
        amount: parseFloat(amount.replace(/\s/g, "")),
        paymentMethod: method as "cash" | "card" | "transfer",
        receivedBy,
        orderId: type === "order_payment" ? orderId : undefined,
        note: note || undefined,
        date,
      };

      addNewIncome(input);

      setTimeout(() => {
        onOpenChange(false);
        // Reset form
        setDate(todayUz());
        setType("order_payment");
        setOrderId("");
        setAmount("");
        setMethod("cash");
        setReceivedBy("Admin");
        setNote("");
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error adding income:", error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kirim qo'shish</DialogTitle>
          <DialogDescription>Manually add a new income record</DialogDescription>
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
            <Label htmlFor="type">Turi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_payment">Buyurtma to'lovi</SelectItem>
                <SelectItem value="scrap">Makulatura</SelectItem>
                <SelectItem value="other">Boshqa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order ID - conditional */}
          {type === "order_payment" && (
            <div className="space-y-2">
              <Label htmlFor="orderId">Buyurtma ID</Label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger id="orderId">
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order} value={order}>
                      {order}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">To'lov usuli</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Naqd</SelectItem>
                <SelectItem value="card">Plastik</SelectItem>
                <SelectItem value="transfer">O'tkazma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Received By */}
          <div className="space-y-2">
            <Label htmlFor="receivedBy">Kim qabul qildi</Label>
            <Select value={receivedBy} onValueChange={setReceivedBy}>
              <SelectTrigger id="receivedBy">
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

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Izoh</Label>
            <Textarea
              id="note"
              placeholder="Qo'shimcha ma'lumot..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button disabled={!amount || loading} onClick={handleSave}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
