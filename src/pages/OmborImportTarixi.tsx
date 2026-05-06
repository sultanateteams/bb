import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parse } from "date-fns";
import { CalendarIcon, ArrowLeft, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BranchBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmborStore } from "@/lib/omborStore";
import { cn, formatNumber } from "@/lib/utils";
import { PaymentDialog } from "@/components/kreditorlik/PaymentDialog";

function parseUz(d: string): Date {
  return parse(d, "dd.MM.yyyy", new Date());
}

export default function OmborImportTarixi() {
  const navigate = useNavigate();
  const history = useOmborStore((s) => s.history);
  const suppliers = useOmborStore((s) => s.suppliers);
  const [branch, setBranch] = useState<"all" | "ich" | "wl" | "tm">("all");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [paymentHistoryId, setPaymentHistoryId] = useState<number | null>(null);

  const rows = useMemo(() => {
    return history
      .filter((h) => {
        if (branch !== "all" && h.branch !== branch) return false;
        const d = parseUz(h.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .sort((a, b) => parseUz(b.date).getTime() - parseUz(a.date).getTime());
  }, [history, branch, from, to]);

  const isFullyPaid = (r: typeof history[0]) => {
    if (r.tolangan_summa === undefined && r.jami_summa === undefined) return true; // legacy
    return r.tolov_holati === "tolangan";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Tarixi"
        subtitle="Barcha import yozuvlari"
        actions={
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/ombor")}>
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </Button>
        }
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-2">
          <Select value={branch} onValueChange={(v) => setBranch(v as any)}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="ich">ICH</SelectItem>
              <SelectItem value="wl">WL</SelectItem>
              <SelectItem value="tm">TM</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2", !from && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4" />
                {from ? format(from, "dd.MM.yyyy") : "Boshlanish"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={from} onSelect={setFrom} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2", !to && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4" />
                {to ? format(to, "dd.MM.yyyy") : "Tugash"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={to} onSelect={setTo} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          {(from || to) && (
            <Button variant="ghost" size="sm" onClick={() => { setFrom(undefined); setTo(undefined); }}>Tozalash</Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">{rows.length} ta yozuv</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">No</th>
              <th>Nomi</th>
              <th>Turi</th>
              <th>Miqdori</th>
              <th>Jami summa</th>
              <th>Ta'minotchi</th>
              <th>To'langan</th>
              <th>Qoldiq</th>
              <th>Holat</th>
              <th>Sana</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={11} className="text-center text-muted-foreground py-8">Yozuv yo'q</td></tr>
            )}
            {rows.map((r, i) => {
              const supplier = suppliers.find((s) => s.id === r.tamirotchi_id);
              const fullyPaid = isFullyPaid(r);
              return (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{i + 1}</td>
                  <td className="font-medium">{r.name}</td>
                  <td><BranchBadge branch={r.branch} /></td>
                  <td className="tabular-nums font-semibold">{r.qty} {r.unit}</td>
                  <td className="tabular-nums font-semibold">{r.total} so'm</td>
                  <td>
                    {supplier ? (
                      <button className="text-primary hover:underline text-sm" onClick={() => navigate(`/tamirotchilar/${supplier.id}`)}>
                        {supplier.nomi}
                      </button>
                    ) : "—"}
                  </td>
                  <td className="tabular-nums text-green-600">{r.tolangan_summa !== undefined ? formatNumber(r.tolangan_summa) : "—"}</td>
                  <td className={`tabular-nums font-semibold ${(r.qoldiq || 0) > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                    {r.qoldiq !== undefined ? (r.qoldiq > 0 ? formatNumber(r.qoldiq) : "—") : "—"}
                  </td>
                  <td>
                    {r.tolov_holati ? (
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        r.tolov_holati === "tolangan" ? "bg-green-100 text-green-800" :
                        r.tolov_holati === "qisman" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {r.tolov_holati === "tolangan" ? "To'langan" : r.tolov_holati === "qisman" ? "Qisman" : "To'lanmagan"}
                      </span>
                    ) : "—"}
                  </td>
                  <td>{r.date}</td>
                  <td>
                    {!fullyPaid && (r.qoldiq || 0) > 0 ? (
                      <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => setPaymentHistoryId(r.id)}>
                        <CreditCard className="h-3.5 w-3.5" /> To'lov
                      </Button>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paymentHistoryId && (
        <PaymentDialog
          open={!!paymentHistoryId}
          onOpenChange={(open) => { if (!open) setPaymentHistoryId(null); }}
          historyId={paymentHistoryId}
        />
      )}
    </div>
  );
}
