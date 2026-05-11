import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useOmborStore, getSupplierTotalKreditorlik } from "@/lib/omborStore";
import { formatNumber } from "@/lib/utils";
import { SupplierDialog } from "@/components/tamirotchilar/SupplierDialog";
import type { Supplier } from "@/services/suppliers.service";
import { getSuppliers } from "@/services/suppliers.service";

export default function TamirotchilarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const history = useOmborStore((s) => s.history);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"import" | "payments">("import");

  const loadSupplier = async () => {
    if (!id) return;
    try {
      const list = await getSuppliers();
      const found = list.find((s) => s.id === Number(id));
      if (found) setSupplier(found);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    }
  };

  useEffect(() => { loadSupplier(); }, [id]);

  if (notFound || (!supplier && id)) {
    return (
      <>
        <PageHeader title="Ta'minotchi topilmadi" />
        <div className="rounded-lg border border-dashed py-8 text-center text-gray-500">
          <p>Bunday ta'minotchi mavjud emas</p>
          <Button
            variant="outline"
            onClick={() => navigate("/tamirotchilar")}
            className="mt-4"
          >
            Orqaga qaytish
          </Button>
        </div>
      </>
    );
  }

  if (!supplier) {
    return <div className="py-8 text-center text-gray-400">Yuklanmoqda...</div>;
  }

  const supplierImports = history.filter((h) => h.tamirotchi_id === String(id));
  const totalCredit = getSupplierTotalKreditorlik(String(id));
  const totalPurchase = supplierImports.reduce((sum, h) => sum + (h.jami_summa || 0), 0);
  const allPayments = supplierImports
    .flatMap((h) => (h.tolov_tarixi || []).map((p) => ({ ...p, importId: h.id })))
    .sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/tamirotchilar")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
      </div>

      <PageHeader title="Ta'minotchi: Batafsil" />

      {/* Supplier Info Card */}
      <div className="mb-6 rounded-lg border bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{supplier.name}</h2>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>{supplier.phone}</span>
              </div>
              {supplier.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" />
                  <span>{supplier.address}</span>
                </div>
              )}
              {supplier.inn && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <span>INN: {supplier.inn}</span>
                </div>
              )}
              {supplier.note && (
                <div className="text-sm italic text-gray-500">{supplier.note}</div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Tahrirlash
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Jami importlar soni</p>
          <p className="mt-2 text-2xl font-bold">{supplierImports.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Jami xarid summasi</p>
          <p className="mt-2 text-2xl font-bold">{formatNumber(totalPurchase)} so'm</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">Hozirgi kreditorlik</p>
          <p className={`mt-2 text-2xl font-bold ${totalCredit > 0 ? "text-red-600" : "text-gray-400"}`}>
            {totalCredit > 0 ? formatNumber(totalCredit) : "—"} {totalCredit > 0 ? "so'm" : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-3 font-medium ${
              activeTab === "import"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Import tarixi
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-3 font-medium ${
              activeTab === "payments"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            To'lovlar tarixi
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "import" && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sana</th>
                  <th className="px-4 py-3 text-left font-semibold">Turi</th>
                  <th className="px-4 py-3 text-left font-semibold">Mahsulot</th>
                  <th className="px-4 py-3 text-right font-semibold">Jami summa</th>
                  <th className="px-4 py-3 text-right font-semibold">To'langan</th>
                  <th className="px-4 py-3 text-right font-semibold">Qoldiq</th>
                  <th className="px-4 py-3 text-left font-semibold">Holati</th>
                </tr>
              </thead>
              <tbody>
                {supplierImports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Hech qanday import yo'q
                    </td>
                  </tr>
                ) : (
                  supplierImports.map((imp) => {
                    const statusColor =
                      imp.tolov_holati === "tolangan"
                        ? "bg-green-100 text-green-800"
                        : imp.tolov_holati === "qisman"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800";
                    return (
                      <tr key={imp.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{imp.date}</td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {imp.import_turi === "xomashiyo"
                              ? "Xomashiyo"
                              : imp.import_turi === "tm"
                                ? "TM"
                                : "WL"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{imp.name}</td>
                        <td className="px-4 py-3 text-right">
                          {formatNumber(imp.jami_summa || 0)} so'm
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatNumber(imp.tolangan_summa || 0)} so'm
                        </td>
                        <td className="px-4 py-3 text-right">
                          {imp.qoldiq && imp.qoldiq > 0 ? (
                            <span className="text-red-600 font-semibold">
                              {formatNumber(imp.qoldiq)} so'm
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>
                            {imp.tolov_holati === "tolangan"
                              ? "To'langan"
                              : imp.tolov_holati === "qisman"
                                ? "Qisman"
                                : "To'lanmagan"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sana</th>
                  <th className="px-4 py-3 text-right font-semibold">Summa</th>
                  <th className="px-4 py-3 text-left font-semibold">Usul</th>
                  <th className="px-4 py-3 text-left font-semibold">Izoh</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Hech qanday to'lov yo'q
                    </td>
                  </tr>
                ) : (
                  allPayments.map((payment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{payment.sana}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatNumber(payment.summa)} so'm
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">
                          {payment.usul === "naqt"
                            ? "Naqd"
                            : payment.usul === "plastik"
                              ? "Plastik"
                              : "O'tkazma"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{payment.izoh || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <SupplierDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        supplier={supplier}
        onSuccess={loadSupplier}
      />
    </>
  );
}
