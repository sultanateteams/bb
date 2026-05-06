import { useState } from "react";
import { Plus, Search, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { useOmborStore, getKreditorlikList } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { PaymentDialog } from "@/components/kreditorlik/PaymentDialog";
import { KreditorlikDetailPanel } from "@/components/kreditorlik/KreditorlikDetailPanel";

type FilterStatus = "hammasi" | "tolanmagan" | "qisman" | "muddati_otgan";
type FilterType = "hammasi" | "xomashiyo" | "tm" | "wl";

export default function Kreditorlik() {
  const suppliers = useOmborStore((s) => s.suppliers);
  const kreditorlikList = getKreditorlikList();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("hammasi");
  const [typeFilter, setTypeFilter] = useState<FilterType>("hammasi");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);
  const [detailImportId, setDetailImportId] = useState<number | null>(null);

  // Filter kreditorlik records
  const filteredList = kreditorlikList.filter((record) => {
    const supplier = suppliers.find((s) => s.id === record.tamirotchi_id);
    const supplierName = supplier?.nomi || "";

    // Status filter
    if (statusFilter !== "hammasi") {
      const today = new Date();
      const deadline = record.tolov_muddati ? new Date(record.tolov_muddati) : null;
      const isOverdue = deadline && deadline < today;

      if (statusFilter === "muddati_otgan" && !isOverdue) return false;
      if (statusFilter === "tolanmagan" && record.tolov_holati !== "tolanmagan") return false;
      if (statusFilter === "qisman" && record.tolov_holati !== "qisman") return false;
    }

    // Type filter
    if (typeFilter !== "hammasi" && record.import_turi !== typeFilter) return false;

    // Supplier filter
    if (supplierFilter && record.tamirotchi_id !== supplierFilter) return false;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        supplierName.toLowerCase().includes(searchLower) ||
        record.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Calculate stats
  const totalKreditorlik = kreditorlikList.reduce((sum, r) => sum + (r.qoldiq || 0), 0);
  const overdueCnt = kreditorlikList.filter((r) => {
    const deadline = r.tolov_muddati ? new Date(r.tolov_muddati) : null;
    return deadline && deadline < new Date();
  }).length;
  const overdueSum = kreditorlikList
    .filter((r) => {
      const deadline = r.tolov_muddati ? new Date(r.tolov_muddati) : null;
      return deadline && deadline < new Date();
    })
    .reduce((sum, r) => sum + (r.qoldiq || 0), 0);
  const uniqueSuppliers = new Set(kreditorlikList.map((r) => r.tamirotchi_id)).size;

  // Average payment deadline
  const deadlineDays: number[] = kreditorlikList
    .filter((r) => r.tolov_muddati)
    .map((r) => {
      const today = new Date();
      const deadline = new Date(r.tolov_muddati!);
      const diffTime = deadline.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
  const avgDeadline = deadlineDays.length > 0 ? Math.round(deadlineDays.reduce((a, b) => a + b, 0) / deadlineDays.length) : 0;

  return (
    <>
      <PageHeader title="Kreditorlik" subtitle="Ta'minotchilarga bo'lgan qarzlar" showExport />

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Umumiy kreditorlik</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatNumber(totalKreditorlik)} so'm</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Bu oy muddati o'tgan</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {overdueSum > 0 ? formatNumber(overdueSum) : "—"} {overdueSum > 0 ? "so'm" : ""}
          </p>
          <p className="mt-1 text-xs text-red-600">{overdueCnt} ta to'lov</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Ta'minotchilar soni</p>
          <p className="mt-2 text-2xl font-bold">{uniqueSuppliers}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">O'rtacha to'lov muddati</p>
          <p className="mt-2 text-2xl font-bold">{avgDeadline} kun</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 rounded-lg border bg-white p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-1">Holati</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="hammasi">Hammasi</option>
              <option value="tolanmagan">To'lanmagan</option>
              <option value="qisman">Qisman</option>
              <option value="muddati_otgan">Muddati o'tgan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Import turi</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="hammasi">Hammasi</option>
              <option value="xomashiyo">Xomashiyo</option>
              <option value="tm">TM</option>
              <option value="wl">WL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ta'minotchi</label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">Hammasi</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qidiruv</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Nomi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kreditorlik Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">No</th>
              <th className="px-4 py-3 text-left font-semibold">Sana</th>
              <th className="px-4 py-3 text-left font-semibold">Ta'minotchi</th>
              <th className="px-4 py-3 text-left font-semibold">Turi</th>
              <th className="px-4 py-3 text-left font-semibold">Mahsulot</th>
              <th className="px-4 py-3 text-right font-semibold">Jami summa</th>
              <th className="px-4 py-3 text-right font-semibold">To'langan</th>
              <th className="px-4 py-3 text-right font-semibold">Qoldiq</th>
              <th className="px-4 py-3 text-left font-semibold">To'lov muddati</th>
              <th className="px-4 py-3 text-left font-semibold">Holati</th>
              <th className="px-4 py-3 text-left font-semibold">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  Kreditorlik yo'q
                </td>
              </tr>
            ) : (
              filteredList.map((record, idx) => {
                const supplier = suppliers.find((s) => s.id === record.tamirotchi_id);
                const deadline = record.tolov_muddati ? new Date(record.tolov_muddati) : null;
                const today = new Date();
                const isOverdue = deadline && deadline < today;
                const daysLeft = deadline
                  ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                const statusColor =
                  record.tolov_holati === "tolangan"
                    ? "bg-green-100 text-green-800"
                    : record.tolov_holati === "qisman"
                      ? "bg-orange-100 text-orange-800"
                      : isOverdue
                        ? "bg-red-900 text-red-100"
                        : "bg-red-100 text-red-800";

                return (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{record.date}</td>
                    <td className="px-4 py-3">{supplier?.nomi || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {record.import_turi === "xomashiyo"
                          ? "Xomashiyo"
                          : record.import_turi === "tm"
                            ? "TM"
                            : "WL"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{record.name}</td>
                    <td className="px-4 py-3 text-right">
                      {formatNumber(record.jami_summa || 0)} so'm
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatNumber(record.tolangan_summa || 0)} so'm
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatNumber(record.qoldiq || 0)} so'm
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span>{record.tolov_muddati || "—"}</span>
                        {isOverdue && daysLeft !== null && (
                          <span className="text-xs text-red-600 font-semibold">
                            Kechikkan: {Math.abs(daysLeft)} kun
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>
                        {isOverdue && record.tolov_holati !== "tolangan"
                          ? "Muddati o'tgan"
                          : record.tolov_holati === "tolangan"
                            ? "To'langan"
                            : record.tolov_holati === "qisman"
                              ? "Qisman"
                              : "To'lanmagan"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedImportId(record.id);
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
                          onClick={() => setDetailImportId(record.id)}
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

      {/* Footer Summary */}
      {filteredList.length > 0 && (
        <div className="mt-4 flex justify-end rounded-lg border bg-gray-50 p-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Filtrlangan qoldiq jami:</p>
            <p className="text-xl font-bold text-red-600">
              {formatNumber(filteredList.reduce((sum, r) => sum + (r.qoldiq || 0), 0))} so'm
            </p>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {selectedImportId && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowPaymentDialog(false);
              setSelectedImportId(null);
            }
          }}
          historyId={selectedImportId}
        />
      )}

      {/* Detail Panel */}
      {detailImportId && (
        <KreditorlikDetailPanel
          historyId={detailImportId}
          onClose={() => setDetailImportId(null)}
        />
      )}
    </>
  );
}
