import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parse } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BranchBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmborStore } from "@/lib/omborStore";
import { cn } from "@/lib/utils";

function parseUz(d: string): Date {
  return parse(d, "dd.MM.yyyy", new Date());
}

export default function OmborImportTarixi() {
  const navigate = useNavigate();
  const history = useOmborStore((s) => s.history);
  const [branch, setBranch] = useState<"all" | "ich" | "wl">("all");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xomashiyo Import Tarixi"
        subtitle="Barcha xomashiyo importi yozuvlari"
        actions={
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/ombor")}>
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </Button>
        }
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-2">
          <Select value={branch} onValueChange={(v) => setBranch(v as "all" | "ich" | "wl")}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="ich">ICH</SelectItem>
              <SelectItem value="wl">WL</SelectItem>
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
              <th>Xomashiyo nomi</th>
              <th>Turi</th>
              <th>Miqdori</th>
              <th>O'lchov</th>
              <th>Narxi</th>
              <th>Jami summa</th>
              <th>Izoh</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-8">Yozuv yo'q</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="text-muted-foreground">{i + 1}</td>
                <td className="font-medium">{r.name}</td>
                <td><BranchBadge branch={r.branch} /></td>
                <td className="tabular-nums font-semibold">{r.qty}</td>
                <td className="text-muted-foreground">{r.unit}</td>
                <td className="tabular-nums">{r.price}</td>
                <td className="tabular-nums font-semibold">{r.total} so'm</td>
                <td className="text-muted-foreground">{r.note || "—"}</td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
