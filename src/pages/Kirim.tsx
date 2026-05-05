import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useOmborStore } from "@/lib/omborStore";
import { formatNumber, parseNumber, todayUz } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewIncomeDialog } from "@/components/buyurtma/NewIncomeDialog";
import { Calendar } from "lucide-react";

export default function Kirim() {
  const incomes = useOmborStore((s) => s.incomes);
  const users = ["Admin", "Operator"];
  const [showDialog, setShowDialog] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const typeOptions = [
    { value: "order_payment", label: "Buyurtma to'lovi" },
    { value: "scrap", label: "Makulatura" },
    { value: "other", label: "Boshqa" },
  ];

  const methodOptions = [
    { value: "cash", label: "Naqd" },
    { value: "card", label: "Plastik" },
    { value: "transfer", label: "O'tkazma" },
  ];

  const filtered = useMemo(() => {
    return incomes.filter((income) => {
      if (dateFrom && income.date < dateFrom) return false;
      if (dateTo && income.date > dateTo) return false;
      if (filterType !== "all" && income.type !== filterType) return false;
      if (filterMethod !== "all" && income.paymentMethod !== filterMethod) return false;
      if (filterUser !== "all" && income.receivedBy !== filterUser) return false;
      if (searchQuery && !income.orderId?.includes(searchQuery) && !income.note?.includes(searchQuery)) return false;
      return true;
    });
  }, [incomes, dateFrom, dateTo, filterType, filterMethod, filterUser, searchQuery]);

  const summary = useMemo(() => {
    const total = filtered.reduce((sum, inc) => sum + parseNumber(inc.amount), 0);
    const orderPayments = filtered.filter((i) => i.type === "order_payment").reduce((sum, inc) => sum + parseNumber(inc.amount), 0);
    const scrapIncome = filtered.filter((i) => i.type === "scrap").reduce((sum, inc) => sum + parseNumber(inc.amount), 0);

    // Umumiy qarzdorlik — har doim barcha to'lanmagan buyurtmalardan
    const allOrderPayments = incomes.filter((i) => i.type === "order_payment").reduce((sum, inc) => sum + parseNumber(inc.amount), 0);
    const totalDebt = 18750000; // Dastlabki ma'lumot, backend'dan keladi

    return { total, orderPayments, scrapIncome, totalDebt };
  }, [filtered, incomes]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "order_payment":
        return "bg-blue-100 text-blue-800";
      case "scrap":
        return "bg-yellow-100 text-yellow-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-purple-100 text-purple-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => typeOptions.find((o) => o.value === type)?.label || type;
  const getMethodLabel = (method: string) => methodOptions.find((o) => o.value === method)?.label || method;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Kirim" 
        subtitle="Buyurtma to'lovlari va boshqa kirimlar" 
        showAdd 
        addLabel="Kirim qo'shish" 
        showExport 
        onAdd={() => setShowDialog(true)}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bugun</div>
          <div className="text-xl font-semibold mt-1 text-green-600">+33 500 000 so'm</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bu hafta</div>
          <div className="text-xl font-semibold mt-1 text-green-600">+142 800 000 so'm</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bu oy</div>
          <div className="text-xl font-semibold mt-1 text-green-600">+827 100 000 so'm</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date Range */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Dan</label>
              <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Gacha</label>
              <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="To'lov usuli" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {methodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Filter */}
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Kim qabul qildi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {users.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <Input
            placeholder="Buyurtma ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sana</th>
                <th>Turi</th>
                <th>Buyurtma ID</th>
                <th className="text-right">Summasi</th>
                <th>To'lov usuli</th>
                <th>Kim qabul qildi</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Hali kirim yozuvlari yo'q
                  </td>
                </tr>
              ) : (
                filtered.map((income) => (
                  <tr key={income.id}>
                    <td className="whitespace-nowrap">{income.date}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getTypeBadgeColor(income.type)}`}>
                        {getTypeLabel(income.type)}
                      </span>
                    </td>
                    <td className="font-medium">{income.orderId || "—"}</td>
                    <td className="text-right font-semibold tabular-nums text-green-600">
                      +{formatNumber(parseNumber(income.amount))} so'm
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getMethodBadgeColor(income.paymentMethod)}`}>
                        {getMethodLabel(income.paymentMethod)}
                      </span>
                    </td>
                    <td>{income.receivedBy}</td>
                    <td className="text-muted-foreground max-w-xs truncate">{income.note || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Umumiy tushumlar:</span>
            <span className="font-semibold text-green-600">+{formatNumber(summary.total)} so'm</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Buyurtma to'lovlari:</span>
            <span className="font-semibold text-green-600">+{formatNumber(summary.orderPayments)} so'm</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Makulatura kirim:</span>
            <span className="font-semibold text-green-600">+{formatNumber(summary.scrapIncome)} so'm</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Umumiy qarzdorlik:</span>
            <span className="font-semibold text-red-600">🔴 {formatNumber(summary.totalDebt)} so'm</span>
          </div>
        </div>
      </div>

      <NewIncomeDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
