import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOmborStore } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { PaymentDialog } from "./PaymentDialog";

interface KreditorlikDetailPanelProps {
  historyId: number;
  onClose: () => void;
}

export function KreditorlikDetailPanel({ historyId, onClose }: KreditorlikDetailPanelProps) {
  const history = useOmborStore((s) => s.history);
  const suppliers = useOmborStore((s) => s.suppliers);
  const importRecord = history.find((h) => h.id === historyId);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (!importRecord) return null;

  const supplier = suppliers.find((s) => s.id === importRecord.tamirotchi_id);
  const deadline = importRecord.tolov_muddati ? new Date(importRecord.tolov_muddati) : null;
  const today = new Date();
  const isOverdue = deadline && deadline < today;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-lg font-semibold">Kreditorlik batafsil</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 120px)" }}>
            {/* Import Info */}
            <div>
              <h3 className="mb-3 font-semibold">Import ma'lumotlari</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sana:</span>
                  <span className="font-medium">{importRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turi:</span>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {importRecord.import_turi === "xomashiyo"
                      ? "Xomashiyo"
                      : importRecord.import_turi === "tm"
                        ? "TM"
                        : "WL"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mahsulot:</span>
                  <span className="font-medium">{importRecord.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miqdor:</span>
                  <span className="font-medium">
                    {importRecord.qty} {importRecord.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            {supplier && (
              <div>
                <h3 className="mb-3 font-semibold">Ta'minotchi</h3>
                <div className="space-y-2 rounded border bg-gray-50 p-3 text-sm">
                  <div className="font-medium">{supplier.nomi}</div>
                  <div className="text-gray-600">{supplier.telefon}</div>
                  {supplier.manzil && <div className="text-gray-600">{supplier.manzil}</div>}
                  {supplier.inn && <div className="text-gray-600">INN: {supplier.inn}</div>}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div>
              <h3 className="mb-3 font-semibold">Moliyaviy xulosa</h3>
              <div className="space-y-2 rounded border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jami summa:</span>
                  <span className="font-semibold">
                    {formatNumber(importRecord.jami_summa || 0)} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To'langan:</span>
                  <span className="font-semibold">
                    {formatNumber(importRecord.tolangan_summa || 0)} so'm
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600">Qoldiq:</span>
                  <span className="font-bold text-red-600">
                    {formatNumber(importRecord.qoldiq || 0)} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To'lov muddati:</span>
                  <span className="font-medium">
                    {importRecord.tolov_muddati || "—"}
                    {isOverdue && daysLeft !== null && (
                      <div className="text-xs text-red-600 font-semibold">
                        Kechikkan: {Math.abs(daysLeft)} kun
                      </div>
                    )}
                    {!isOverdue && daysLeft !== null && daysLeft > 0 && (
                      <div className="text-xs text-gray-500">
                        {daysLeft} kun qoldi
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {importRecord.tolov_tarixi && importRecord.tolov_tarixi.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">To'lovlar tarixi</h3>
                <div className="space-y-2 rounded border">
                  {importRecord.tolov_tarixi.map((payment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{payment.sana}</div>
                        <div className="text-xs text-gray-500">
                          {payment.usul === "naqt"
                            ? "Naqd"
                            : payment.usul === "plastik"
                              ? "Plastik"
                              : "O'tkazma"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatNumber(payment.summa)} so'm
                        </div>
                        {payment.izoh && (
                          <div className="text-xs text-gray-500">{payment.izoh}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-6">
            {importRecord.qoldiq && importRecord.qoldiq > 0 && (
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full gap-2"
              >
                <CreditCard className="h-4 w-4" />
                To'lov qo'shish
              </Button>
            )}
            {(!importRecord.qoldiq || importRecord.qoldiq === 0) && (
              <div className="rounded bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                To'lov to'liq bajarildi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          historyId={historyId}
        />
      )}
    </>
  );
}
