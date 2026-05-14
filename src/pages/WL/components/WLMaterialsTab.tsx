import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type BackendResp<T> = { data: T; status: number };

interface RawMaterialItem {
  id: number;
  name: string;
  unit: string;
  standard_price: number;
  current_stock: number;
}

interface RawMaterialListResp {
  raw_material_types: RawMaterialItem[];
  pagination: { total: number };
}

async function getWLRawMaterials(): Promise<RawMaterialItem[]> {
  const { data } = await httpClient.get<BackendResp<RawMaterialListResp>>(
    "/raw-material-types?production_type=wl&limit=200&is_active=true",
  );
  return data.data?.raw_material_types || [];
}

export default function WLMaterialsTab() {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["raw-material-types", "wl"],
    queryFn: getWLRawMaterials,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nomi</th>
            <th className="text-right">Miqdori</th>
            <th>O'lchov birligi</th>
            <th className="text-right">Narxi</th>
            <th className="text-right">Jami qiymati</th>
          </tr>
        </thead>
        <tbody>
          {materials.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground py-8">
                Hech narsa topilmadi
              </td>
            </tr>
          )}
          {materials.map((m) => {
            const total = m.current_stock * m.standard_price;
            return (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td className="text-right tabular-nums">{formatNumber(m.current_stock)}</td>
                <td className="text-muted-foreground">{m.unit}</td>
                <td className="text-right tabular-nums">{formatNumber(m.standard_price)} so'm</td>
                <td className="text-right tabular-nums">{formatNumber(total)} so'm</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
