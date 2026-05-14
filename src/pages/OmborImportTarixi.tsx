import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTmPurchasesQuery } from "@/hooks/api/tm-purchases.hooks";
import { cn, formatNumber } from "@/lib/utils";

export default function OmborImportTarixi() {
  const navigate = useNavigate();
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const { data, isLoading, isError, error } = useTmPurchasesQuery({
    page: 1,
    limit: 200,
    purchase_type: "raw_material",
  });

  const rows = useMemo(() => {
    const purchases = data?.purchases ?? [];
    return purchases.filter((p) => {
        const d = new Date(p.created_at);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
  }, [data?.purchases, from, to]);

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
              <th>Import ID</th>
              <th>Ta'minotchi</th>
              <th>Itemlar soni</th>
              <th>Jami summa</th>
              <th>To'langan</th>
              <th>Qoldiq</th>
              <th>Holat</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-8">Yuklanmoqda...</td></tr>
            )}
            {isError && (
              <tr><td colSpan={9} className="text-center text-destructive py-8">{(error as any)?.message || "Xatolik yuz berdi"}</td></tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-8">Yozuv yo'q</td></tr>
            )}
            {rows.map((r, i) => {
              const fullyPaid = r.debt_amount <= 0.001;
              return (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{i + 1}</td>
                  <td className="font-medium">#{r.id}</td>
                  <td>{r.supplier_name}</td>
                  <td className="tabular-nums">{r.item_count}</td>
                  <td className="tabular-nums font-semibold">{formatNumber(r.total_amount)} so'm</td>
                  <td className="tabular-nums text-green-600">{formatNumber(r.paid_amount)}</td>
                  <td className={`tabular-nums font-semibold ${r.debt_amount > 0.001 ? "text-red-600" : "text-muted-foreground"}`}>
                    {r.debt_amount > 0.001 ? formatNumber(r.debt_amount) : "—"}
                  </td>
                  <td>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        fullyPaid ? "bg-green-100 text-green-800" : (r.paid_amount > 0 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800")
                      }`}>
                        {fullyPaid ? "To'langan" : (r.paid_amount > 0 ? "Qisman" : "To'lanmagan")}
                      </span>
                  </td>
                  <td>{format(new Date(r.created_at), "dd.MM.yyyy")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
