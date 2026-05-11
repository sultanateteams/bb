import { useState } from "react";
import { Search, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { formatNumber } from "@/lib/utils";
import { useTmPurchasesQuery } from "@/hooks/api/tm-purchases.hooks";
import { PaymentDialog } from "@/components/kreditorlik/PaymentDialog";
import { KreditorlikDetailPanel } from "@/components/kreditorlik/KreditorlikDetailPanel";

export default function Kreditorlik() {
  const [search, setSearch] = useState("");
  const [supplierIdFilter, setSupplierIdFilter] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [detailPurchaseId, setDetailPurchaseId] = useState<number | null>(null);

  const { data, isLoading } = useTmPurchasesQuery({
    search: search || undefined,
    supplier_id: supplierIdFilter ? Number(supplierIdFilter) : undefined,
    only_with_debt: true,
    limit: 200,
  });

  const purchases = (data?.purchases ?? []).filter((p) => p.debt_amount > 0);

  const totalDebt = purchases.reduce((sum, p) => sum + p.debt_amount, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paid_amount, 0);
  const totalAmount = purchases.reduce((sum, p) => sum + p.total_amount, 0);

  const today = new Date();
  const overdueList = purchases.filter((p) => {
    if (!p.payment_due_date) return false;
    return new Date(p.payment_due_date) < today;
  });
  const overdueDebt = overdueList.reduce((sum, p) => sum + p.debt_amount, 0);
  const uniqueSuppliers = new Set(purchases.map((p) => p.supplier_id)).size;

  const deadlineDays = purchases
    .filter((p) => p.payment_due_date)
    .map((p) => {
      const diff = new Date(p.payment_due_date!).getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });
  const avgDeadline =
    deadlineDays.length > 0
      ? Math.round(deadlineDays.reduce((a, b) => a + b, 0) / deadlineDays.length)
      : 0;

  return (
    <>
      <PageHeader title="Kreditorlik" subtitle="Ta'minotchilarga bo'lgan qarzlar" showExport />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Umumiy qarz</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatNumber(totalDebt)} so'm</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Muddati o'tgan</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {overdueDebt > 0 ? formatNumber(overdueDebt) : "—"}{" "}
            {overdueDebt > 0 ? "so'm" : ""}
          </p>
          <p className="mt-1 text-xs text-red-600">{overdueList.length} ta to'lov</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Ta'minotchilar soni</p>
          <p className="mt-2 text-2xl font-bold">{uniqueSuppliers}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">O'rtacha to'lov muddati</p>
          <p className="mt-2 text-2xl font-bold">
            {avgDeadline > 0 ? `${avgDeadline} kun` : "NaN kun"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Qidiruv</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Ta'minotchi nomi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">No</th>
              <th className="px-4 py-3 text-left font-semibold">Sana</th>
              <th className="px-4 py-3 text-left font-semibold">Ta'minotchi</th>
              <th className="px-4 py-3 text-left font-semibold">Mahsulotlar</th>
              <th className="px-4 py-3 text-right font-semibold">Jami summa</th>
              <th className="px-4 py-3 text-right font-semibold">To'langan</th>
              <th className="px-4 py-3 text-right font-semibold">Qoldiq</th>
              <th className="px-4 py-3 text-left font-semibold">To'lov muddati</th>
              <th className="px-4 py-3 text-left font-semibold">Holati</th>
              <th className="px-4 py-3 text-left font-semibold">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Kreditorlik yo'q
                </td>
              </tr>
            ) : (
              purchases.map((p, idx) => {
                const deadline = p.payment_due_date ? new Date(p.payment_due_date) : null;
                const isOverdue = deadline && deadline < today;
                const daysLeft = deadline
                  ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                const isPartial = p.paid_amount > 0;
                const statusColor = isOverdue
                  ? "bg-red-900 text-red-100"
                  : isPartial
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800";
                const statusLabel = isOverdue
                  ? "Muddati o'tgan"
                  : isPartial
                  ? "Qisman"
                  : "To'lanmagan";

                const createdDate = new Date(p.created_at);
                const dateStr = `${String(createdDate.getDate()).padStart(2, "0")}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${createdDate.getFullYear()}`;

                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{dateStr}</td>
                    <td className="px-4 py-3 font-medium">{p.supplier_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.item_count} ta mahsulot
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(p.total_amount)} so'm</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatNumber(p.paid_amount)} so'm
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatNumber(p.debt_amount)} so'm
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span>
                          {p.payment_due_date
                            ? (() => {
                                const d = new Date(p.payment_due_date);
                                return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
                              })()
                            : "—"}
                        </span>
                        {isOverdue && daysLeft !== null && (
                          <span className="text-xs text-red-600 font-semibold">
                            Kechikkan: {Math.abs(daysLeft)} kun
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPurchaseId(p.id);
                            setShowPaymentDialog(true);
                          }}
                          className="gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <CreditCard className="h-4 w-4" />
                          To'lov
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailPurchaseId(p.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      {purchases.length > 0 && (
        <div className="mt-4 flex justify-end rounded-lg border bg-gray-50 p-4">
          <div className="text-right space-y-1">
            <div className="flex gap-8 text-sm text-gray-600">
              <span>Jami summa: <span className="font-semibold text-gray-900">{formatNumber(totalAmount)} so'm</span></span>
              <span>To'langan: <span className="font-semibold text-green-600">{formatNumber(totalPaid)} so'm</span></span>
            </div>
            <p className="text-sm text-gray-600">
              Filtrlangan qoldiq jami:{" "}
              <span className="text-xl font-bold text-red-600">{formatNumber(totalDebt)} so'm</span>
            </p>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {selectedPurchaseId && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowPaymentDialog(false);
              setSelectedPurchaseId(null);
            }
          }}
          purchaseId={selectedPurchaseId}
        />
      )}

      {/* Detail Panel */}
      <KreditorlikDetailPanel
        open={!!detailPurchaseId}
        onClose={() => setDetailPurchaseId(null)}
        purchaseId={detailPurchaseId}
      />
    </>
  );
}
