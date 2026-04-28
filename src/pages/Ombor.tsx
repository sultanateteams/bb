import { PageHeader } from "@/components/PageHeader";
import { BranchBadge } from "@/components/Badges";
import { products, rawMaterials } from "@/lib/mockData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function StockTable({ rows }: { rows: typeof products }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Qidirish..." className="pl-9 h-9" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{rows.length} ta yozuv</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nom</th><th>Yo'nalish</th><th>Birlik</th><th>Qoldiq</th><th>Min</th><th>Holat</th><th className="text-right">Narx (so'm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const low = r.stock < r.min;
            return (
              <tr key={r.id}>
                <td className="font-medium">{r.name}</td>
                <td><BranchBadge branch={r.branch} /></td>
                <td className="text-muted-foreground">{r.unit}</td>
                <td className={cn("font-semibold tabular-nums", low && "text-destructive")}>{r.stock}</td>
                <td className="text-muted-foreground tabular-nums">{r.min}</td>
                <td>
                  {low ? (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" /> Kam
                    </span>
                  ) : (
                    <span className="text-xs text-success">Yetarli</span>
                  )}
                </td>
                <td className="text-right tabular-nums">{r.price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Ombor() {
  return (
    <div className="space-y-6">
      <PageHeader title="Ombor" subtitle="Tayyor mahsulot va xomashiyo qoldiqlari" showAdd showExport addLabel="Import qilish" />
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Tayyor mahsulot ({products.length})</TabsTrigger>
          <TabsTrigger value="raw">Xomashiyo ({rawMaterials.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><StockTable rows={products} /></TabsContent>
        <TabsContent value="raw"><StockTable rows={rawMaterials as any} /></TabsContent>
      </Tabs>
    </div>
  );
}
