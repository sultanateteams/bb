import { useMemo, useState } from "react";
import { wlOps, products } from "@/lib/mockData";
import { StatusBadge } from "@/components/Badges";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { WlOp, WlStatus } from "@/lib/mockData";

interface Props {
  onDetail: (record: WlOp) => void;
}

export default function WLArchiveTab({ onDetail }: Props) {
  const [statusFilter, setStatusFilter] = useState<WlStatus | "all">("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const wlProducts = products.filter((p) => p.branch === "wl");

  const filteredOps = useMemo(() => {
    return wlOps.filter((op) => {
      if (statusFilter !== "all" && op.status !== statusFilter) return false;
      if (productFilter !== "all" && op.productId.toString() !== productFilter) return false;
      if (dateFrom && op.date < dateFrom) return false;
      if (dateTo && op.date > dateTo) return false;
      return true;
    });
  }, [statusFilter, productFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WlStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Holati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="Ishlab chiqarishdagi">Ishlab chiqarishdagi</SelectItem>
              <SelectItem value="Ishlab chiqarilgan">Ishlab chiqarilgan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mahsulot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              {wlProducts.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
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
            {filteredOps.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted-foreground py-8">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
            {filteredOps.map((op) => (
              <tr key={op.id}>
                <td className="font-mono text-xs font-semibold">{op.id}</td>
                <td>{op.date}</td>
                <td className="font-medium">{op.product}</td>
                <td className="text-right tabular-nums">{formatNumber(op.qty)} dona</td>
                <td className="text-right tabular-nums">
                  {op.receivedQuantity ? formatNumber(op.receivedQuantity) : "-"}
                </td>
                <td className="text-right tabular-nums">
                  {op.extraQuantity ? (
                    <span className="text-yellow-600 font-medium">
                      +{formatNumber(op.extraQuantity)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <StatusBadge
                    status={op.status}
                    tone={op.status === "Ishlab chiqarilgan" ? "success" : "warning"}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}