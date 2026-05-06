import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useOmborStore } from "@/lib/omborStore";
import { formatNumber, parseNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewExpenseDialog } from "@/components/ombor/NewExpenseDialog";
import { Calendar, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chiqim() {
  const expenses = useOmborStore((s) => s.expenses);
  const expenseTypes = useOmborStore((s) => s.expenseTypes);
  const users = ["Admin", "Operator"];
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [filterPayType, setFilterPayType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine payment type badge for each expense
  const getPaymentType = (expense: typeof expenses[0]) => {
    const type = expenseTypes.find((t) => t.id === expense.typeId);
    if (type?.name === "Kreditorlik to'lovi") return "kredit";
    if (type?.isAutomatic) return "naqd";
    return "qolda";
  };

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (dateFrom && expense.date < dateFrom) return false;
      if (dateTo && expense.date > dateTo) return false;
      if (filterType !== "all" && expense.typeId !== parseInt(filterType)) return false;
      if (filterUser !== "all" && expense.createdBy !== filterUser) return false;
      if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPayType !== "all") {
        const pt = getPaymentType(expense);
        if (filterPayType !== pt) return false;
      }
      return true;
    });
  }, [expenses, dateFrom, dateTo, filterType, filterUser, searchQuery, filterPayType]);

  const summary = useMemo(() => {
    const total = filtered.reduce((sum, exp) => sum + parseNumber(exp.amount), 0);
    const naqd = filtered.filter((e) => getPaymentType(e) === "naqd").reduce((s, e) => s + parseNumber(e.amount), 0);
    const kredit = filtered.filter((e) => getPaymentType(e) === "kredit").reduce((s, e) => s + parseNumber(e.amount), 0);
    return { total, naqd, kredit };
  }, [filtered]);

  const getTypeBadgeColor = (typeId: number) => {
    const type = expenseTypes.find((t) => t.id === typeId);
    if (!type) return "bg-gray-100 text-gray-800";
    if (type.isAutomatic) {
      if (type.name.includes("ICH")) return "bg-orange-100 text-orange-800";
      if (type.name.includes("WL")) return "bg-cyan-100 text-cyan-800";
      if (type.name.includes("Kreditorlik")) return "bg-blue-100 text-blue-800";
    }
    return "bg-indigo-100 text-indigo-800";
  };

  const getPaymentTypeBadge = (expense: typeof expenses[0]) => {
    const pt = getPaymentType(expense);
    if (pt === "kredit") return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Kredit to'lovi</span>;
    if (pt === "naqd") return <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Naqd to'lov</span>;
    return <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Qo'lda kiritilgan</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Chiqim"
        subtitle="Barcha moliyaviy chiqimlar yagona joyda"
        showAdd
        addLabel="Chiqim qo'shish"
        showExport
        onAdd={() => setShowDialog(true)}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bugun</div>
          <div className="text-xl font-semibold mt-1 text-red-600">−6 900 000 so'm</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bu hafta</div>
          <div className="text-xl font-semibold mt-1 text-red-600">−{formatNumber(summary.total)} so'm</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground">Bu oy</div>
          <div className="text-xl font-semibold mt-1 text-red-600">−214 800 000 so'm</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Date Range */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Dan</label>
              <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm" />
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Gacha</label>
              <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm" />
              </div>
            </div>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Turi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {expenseTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPayType} onValueChange={setFilterPayType}>
            <SelectTrigger className="h-10"><SelectValue placeholder="To'lov turi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="naqd">Naqd to'lovlar</SelectItem>
              <SelectItem value="kredit">Kredit to'lovlari</SelectItem>
              <SelectItem value="qolda">Qo'lda kiritilgan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Kim rasmiylashtridi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {users.map((user) => (<SelectItem key={user} value={user}>{user}</SelectItem>))}
            </SelectContent>
          </Select>

          <Input placeholder="Tavsif..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10" />

          <Button variant="outline" size="sm" onClick={() => navigate("/expense-types")} className="gap-2">
            <Settings2 className="h-4 w-4" /> Chiqim turlari
          </Button>
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
                <th className="text-right">Summasi</th>
                <th>To'lov turi</th>
                <th>Tavsif</th>
                <th>Kim rasmiylashtridi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">Hali chiqim yozuvlari yo'q</td>
                </tr>
              ) : (
                filtered.map((expense) => (
                  <tr key={expense.id}>
                    <td className="whitespace-nowrap">{expense.date}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getTypeBadgeColor(expense.typeId)}`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="text-right font-semibold tabular-nums text-red-600">
                      −{formatNumber(parseNumber(expense.amount))} so'm
                    </td>
                    <td>{getPaymentTypeBadge(expense)}</td>
                    <td className="text-muted-foreground max-w-xs truncate">{expense.description}</td>
                    <td>{expense.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-muted/30 p-4">
          <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
            <span className="text-muted-foreground">Umumiy chiqim:</span>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-red-600">−{formatNumber(summary.total)} so'm</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-sm">Naqd: <span className="font-medium">{formatNumber(summary.naqd)} so'm</span></span>
              <span className="text-muted-foreground">|</span>
              <span className="text-sm">Kredit to'lovlari: <span className="font-medium">{formatNumber(summary.kredit)} so'm</span></span>
            </div>
          </div>
        </div>
      </div>

      <NewExpenseDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
