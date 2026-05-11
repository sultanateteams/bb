import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { PaymentDialog } from "./PaymentDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useTmPurchaseByIDQuery } from "@/hooks/api/tm-purchases.hooks";

interface KreditorlikDetailPanelProps {
  open: boolean;
  onClose: () => void;
  purchaseId: number | null;
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function methodLabel(m: string) {
  if (m === "cash") return "Naqd";
  if (m === "terminal") return "Terminal";
  return "O'tkazma";
}

export function KreditorlikDetailPanel({ open, onClose, purchaseId }: KreditorlikDetailPanelProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const navigate = useNavigate();

  const { data: purchase, isLoading } = useTmPurchaseByIDQuery(purchaseId ?? 0);

  const today = new Date();
  const deadline = purchase?.payment_due_date ? new Date(purchase.payment_due_date) : null;
  const isOverdue = deadline && deadline < today;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isFullyPaid = purchase ? purchase.debt_amount <= 0 : false;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Kreditorlik tafsilotlari</SheetTitle>
          </SheetHeader>

          {isLoading || !purchase ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Yuklanmoqda...
            </div>
          ) : (
            <>
              <div className="space-y-5 p-6">
                {/* Import items */}
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Import ma'lumotlari
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sana:</span>
                    <span className="font-medium">{fmtDate(purchase.created_at)}</span>
                  </div>
                  {purchase.payment_due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">To'lov muddati:</span>
                      <span className="font-medium">{fmtDate(purchase.payment_due_date)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Mahsulotlar:</p>
                    {purchase.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.product_type_name}</span>
                        <span className="text-gray-500 text-xs">
                          {item.quantity} × {formatNumber(item.unit_price)} ={" "}
                          <span className="font-semibold text-gray-800">
                            {formatNumber(item.total_price)} so'm
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier */}
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Ta'minotchi
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{purchase.supplier_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary gap-1 p-0"
                      onClick={() => {
                        onClose();
                        navigate(`/tamirotchilar/${purchase.supplier_id}`);
                      }}
                    >
                      <ExternalLink className="h-3 w-3" /> Ko'rish
                    </Button>
                  </div>
                </div>

                {/* Financial state */}
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Moliyaviy holat
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jami summa:</span>
                    <span className="font-semibold">{formatNumber(purchase.total_amount)} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To'langan:</span>
                    <span className="font-semibold text-green-600">
                      {formatNumber(purchase.paid_amount)} so'm
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Qoldiq:</span>
                    <span
                      className={`font-bold ${purchase.debt_amount > 0 ? "text-red-600" : "text-gray-500"}`}
                    >
                      {formatNumber(purchase.debt_amount)} so'm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holat:</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        isFullyPaid
                          ? "bg-green-100 text-green-800"
                          : isOverdue
                          ? "bg-red-900 text-red-100"
                          : purchase.paid_amount > 0
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isFullyPaid
                        ? "To'langan"
                        : isOverdue
                        ? "Muddati o'tgan"
                        : purchase.paid_amount > 0
                        ? "Qisman"
                        : "To'lanmagan"}
                    </span>
                  </div>
                  {isOverdue && daysLeft !== null && (
                    <div className="text-xs text-red-600 font-semibold">
                      ⚠️ Kechikkan: {Math.abs(daysLeft)} kun
                    </div>
                  )}
                  {!isOverdue && daysLeft !== null && daysLeft > 0 && (
                    <div className="text-xs text-gray-500">📅 {daysLeft} kun qoldi</div>
                  )}
                </div>

                {/* Payment history */}
                <div className="rounded-lg border overflow-hidden">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider p-3 border-b bg-gray-50">
                    To'lovlar tarixi
                  </h4>
                  {purchase.transactions.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50/50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium">Sana</th>
                          <th className="px-3 py-2 text-right text-xs font-medium">Summa</th>
                          <th className="px-3 py-2 text-left text-xs font-medium">Usul</th>
                          <th className="px-3 py-2 text-left text-xs font-medium">Izoh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchase.transactions.map((t) => (
                          <tr key={t.id} className="border-b last:border-0">
                            <td className="px-3 py-2 text-xs">{fmtDate(t.payment_date)}</td>
                            <td className="px-3 py-2 text-right text-xs font-semibold">
                              {formatNumber(t.amount)} so'm
                            </td>
                            <td className="px-3 py-2">
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                                {methodLabel(t.payment_method)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-500">
                              {t.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-3 py-6 text-center text-sm text-gray-500">
                      Hali to'lov amalga oshirilmagan
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-6">
                {!isFullyPaid ? (
                  <Button onClick={() => setShowPaymentDialog(true)} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" /> To'lov qo'shish
                  </Button>
                ) : (
                  <div className="rounded bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                    ✅ To'liq to'langan
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {showPaymentDialog && purchaseId && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={(open) => {
            setShowPaymentDialog(open);
            if (!open) {
              // panel stays open to show updated data
            }
          }}
          purchaseId={purchaseId}
        />
      )}
    </>
  );
}
