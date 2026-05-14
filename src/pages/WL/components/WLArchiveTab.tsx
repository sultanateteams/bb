import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/Badges";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Eye } from "lucide-react";
import { listWLProductions, type WLProductionListItem } from "@/services/wl-productions.service";
import { useQuery as useProductQuery } from "@tanstack/react-query";
import { getProductTypes } from "@/services/product-types.service";

interface Props {
  onDetail: (record: WLProductionListItem) => void;
}

const STATUS_LABEL: Record<string, string> = {
  in_production: "Ishlab chiqarishdagi",
  produced: "Ishlab chiqarilgan",
};

export default function WLArchiveTab({ onDetail }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: listResp } = useQuery({
    queryKey: ["wl-productions"],
    queryFn: () => listWLProductions({ limit: 200 }),
  });

  const { data: allProducts = [] } = useProductQuery({
    queryKey: ["product-types"],
    queryFn: getProductTypes,
  });

  const wlProducts = allProducts.filter((p) => p.type === "WL" && p.isActive);
  const productions = listResp?.productions ?? [];

  const filtered = useMemo(() => {
    return productions.filter((op) => {
      if (statusFilter !== "all" && op.status !== statusFilter) return false;
      if (productFilter !== "all" && !op.product_names.includes(productFilter)) return false;
      const date = op.sent_date?.slice(0, 10) ?? "";
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;
      return true;
    });
  }, [productions, statusFilter, productFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Holati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="in_production">Ishlab chiqarishdagi</SelectItem>
              <SelectItem value="produced">Ishlab chiqarilgan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mahsulot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {wlProducts.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Dan:</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Gacha:</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>WL ID</th>
              <th>Sana</th>
              <th>Mahsulot</th>
              <th className="text-right">Miqdori</th>
              <th className="text-right">Qabul qilingan</th>
              <th className="text-right">Ortiqcha</th>
              <th>Holati</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted-foreground py-8">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
            {filtered.map((op) => {
              const label = STATUS_LABEL[op.status] ?? op.status;
              const received = op.received_quantity ?? null;
              const extra = received != null ? received - op.total_quantity : null;
              return (
                <tr key={op.id}>
                  <td className="font-mono text-xs font-semibold">{op.wl_code}</td>
                  <td>{op.sent_date?.slice(0, 10)}</td>
                  <td className="font-medium">{op.product_names}</td>
                  <td className="text-right tabular-nums">
                    {formatNumber(op.total_quantity)} {op.unit}
                  </td>
                  <td className="text-right tabular-nums">
                    {received != null ? formatNumber(received) : "-"}
                  </td>
                  <td className="text-right tabular-nums">
                    {extra != null && extra > 0 ? (
                      <span className="text-yellow-600 font-medium">+{formatNumber(extra)}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <StatusBadge
                      status={label}
                      tone={op.status === "produced" ? "success" : "warning"}
                    />
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDetail(op)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
