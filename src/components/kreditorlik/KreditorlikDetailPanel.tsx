import { useState } from "react";
import { X, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOmborStore } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { PaymentDialog } from "./PaymentDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

interface KreditorlikDetailPanelProps {
  open: boolean;
  onClose: () => void;
  historyId: number | null;
}

export function KreditorlikDetailPanel({ open, onClose, historyId }: KreditorlikDetailPanelProps) {
  const history = useOmborStore((s) => s.history);
  const suppliers = useOmborStore((s) => s.suppliers);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const navigate = useNavigate();

  const importRecord = historyId ? history.find((h) => h.id === historyId) : null;
  if (!importRecord) return null;

  const supplier = suppliers.find((s) => s.id === importRecord.tamirotchi_id);
  const deadline = importRecord.tolov_muddati ? new Date(importRecord.tolov_muddati) : null;
  const today = new Date();
  const isOverdue = deadline && deadline < today;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto p-0">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Kreditorlik tafsilotlari</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 p-6">
            {/* Section 1: Import Info */}
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Import ma'lumotlari</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Import turi:</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {importRecord.import_turi === "xomashiyo" ? "Xomashiyo" : importRecord.import_turi === "tm" ? "TM" : "WL"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sana:</span>
                <span className="font-medium">{importRecord.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mahsulot:</span>
                <span className="font-medium">{importRecord.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miqdor:</span>
                <span className="font-medium">{importRecord.qty} {importRecord.unit}</span>
              </div>
            </div>

            {/* Section 2: Supplier */}
            {supplier && (
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Ta'minotchi</h4>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{supplier.nomi}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-primary gap-1 p-0" onClick={() => { onClose(); navigate(`/tamirotchilar/${supplier.id}`); }}>
                    <ExternalLink className="h-3 w-3" /> Ko'rish
                  </Button>
                </div>
                <div className="text-gray-600">{supplier.telefon}</div>
              </div>
            )}

            {/* Section 3: Financial */}
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Moliyaviy holat</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Jami summa:</span>
                <span className="font-semibold">{formatNumber(importRecord.jami_summa || 0)} so'm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To'langan:</span>
                <span className="font-semibold text-green-600">{formatNumber(importRecord.tolangan_summa || 0)} so'm</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Qoldiq:</span>
                <span className={`font-bold ${(importRecord.qoldiq || 0) > 0 ? "text-red-600" : "text-gray-500"}`}>
                  {formatNumber(importRecord.qoldiq || 0)} so'm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To'lov muddati:</span>
                <span className="font-medium">{importRecord.tolov_muddati || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Holat:</span>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                  importRecord.tolov_holati === "tolangan" ? "bg-green-100 text-green-800" :
                  importRecord.tolov_holati === "qisman" ? "bg-orange-100 text-orange-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {importRecord.tolov_holati === "tolangan" ? "To'langan" : importRecord.tolov_holati === "qisman" ? "Qisman" : "To'lanmagan"}
                </span>
              </div>
              {isOverdue && daysLeft !== null && (
                <div className="text-xs text-red-600 font-semibold">⚠️ Kechikkan: {Math.abs(daysLeft)} kun</div>
              )}
              {!isOverdue && daysLeft !== null && daysLeft > 0 && (
                <div className="text-xs text-gray-500">📅 {daysLeft} kun qoldi</div>
              )}
            </div>

            {/* Section 4: Payment History */}
            <div className="rounded-lg border overflow-hidden">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider p-3 border-b bg-gray-50">To'lovlar tarixi</h4>
              {importRecord.tolov_tarixi && importRecord.tolov_tarixi.length > 0 ? (
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
                    {importRecord.tolov_tarixi.map((payment, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-3 py-2 text-xs">{payment.sana}</td>
                        <td className="px-3 py-2 text-right text-xs font-semibold">{formatNumber(payment.summa)} so'm</td>
                        <td className="px-3 py-2">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                            {payment.usul === "naqt" ? "Naqd" : payment.usul === "plastik" ? "Plastik" : "O'tkazma"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">{payment.izoh || "—"}</td>
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
            {importRecord.tolov_holati !== "tolangan" ? (
              <Button onClick={() => setShowPaymentDialog(true)} className="w-full gap-2">
                <CreditCard className="h-4 w-4" /> To'lov qo'shish
              </Button>
            ) : (
              <div className="rounded bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                ✅ To'liq to'langan
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {showPaymentDialog && (
        <PaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} historyId={historyId!} />
      )}
    </>
  );
}
