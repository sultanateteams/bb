import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { BranchBadge } from "@/components/Badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle, Plus, Download, History } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useOmborStore } from "@/lib/omborStore";
import { TmAddDialog } from "@/components/ombor/TmAddDialog";
import { WlImportDialog } from "@/components/ombor/WlImportDialog";
import { XomashiyoImportDialog } from "@/components/ombor/XomashiyoImportDialog";
import type { Branch, ProductStatus } from "@/lib/mockData";
import { getRawMaterialTypes } from "@/services/raw-material-types.service";
import { getProductTypes } from "@/services/product-types.service";
import { getTmPurchases, getTmPurchaseByID } from "@/services/tm-purchases.service";
import { getOrders, getOrderByID } from "@/services/orders.service";

type UIProductStatus = ProductStatus | "qisman";
type StatusFilter = "all" | UIProductStatus;
type BranchFilter = "all" | Branch;

function StatusPill({ s }: { s: UIProductStatus }) {
  if (s === "qisman") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-warning/15 text-warning">
        Qisman
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
        s === "band" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
      )}
    >
      {s === "band" ? "Band" : "Bo'sh"}
    </span>
  );
}

function ProductsTab({ onTm, onWl }: { onTm: () => void; onWl: () => void }) {
  const { data: productTypes = [] } = useQuery({ queryKey: ["product-types"], queryFn: getProductTypes });
  const { data: tmPurchases } = useQuery({
    queryKey: ["tm-purchases", { purchase_type: "tm", page: 1, limit: 200 }],
    queryFn: () => getTmPurchases({ purchase_type: "tm", page: 1, limit: 200 }),
  });
  const tmDetailQueries = useQueries({
    queries: (tmPurchases?.purchases ?? []).map((p) => ({
      queryKey: ["tm-purchases", p.id],
      queryFn: () => getTmPurchaseByID(p.id),
      enabled: true,
    })),
  });
  const { data: ordersResp } = useQuery({
    queryKey: ["orders", { page: 1, limit: 200 }],
    queryFn: () => getOrders({ page: 1, limit: 200 }),
  });
  const orderDetailQueries = useQueries({
    queries: (ordersResp?.orders ?? []).map((o) => ({
      queryKey: ["orders", o.id],
      queryFn: () => getOrderByID(o.id),
      enabled: true,
    })),
  });

  const products = useMemo(() => {
    const incomingByProduct = new Map<number, number>();
    tmDetailQueries.forEach((q) => {
      q.data?.items?.forEach((it) => {
        if (!it.product_type_id) return;
        incomingByProduct.set(it.product_type_id, (incomingByProduct.get(it.product_type_id) ?? 0) + it.quantity);
      });
    });

    const orderedByProduct = new Map<number, number>();
    orderDetailQueries.forEach((q) => {
      q.data?.items?.forEach((it) => {
        orderedByProduct.set(it.product_type_id, (orderedByProduct.get(it.product_type_id) ?? 0) + it.quantity);
      });
    });

    return productTypes
      .filter((p) => p.isActive)
      .map((p) => {
        const id = Number(p.id);
        const incoming = incomingByProduct.get(id) ?? 0;
        const ordered = orderedByProduct.get(id) ?? 0;
        const stock = incoming - ordered;
        let status: UIProductStatus = "bo'sh";
        if (ordered > 0 && stock <= 0) status = "band";
        else if (ordered > 0 && stock > 0) status = "qisman";

        return {
          id,
          name: p.name,
          branch: p.type.toLowerCase() as Branch,
          status,
          stock,
          unit: p.unit,
          min: p.minStock,
          price: "—",
        };
      });
  }, [productTypes, tmDetailQueries, orderDetailQueries]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [branch, setBranch] = useState<BranchFilter>("all");

  const rows = useMemo(() => {
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (status !== "all" && p.status !== status) return false;
      if (branch !== "all" && p.branch !== branch) return false;
      return true;
    });
  }, [products, q, status, branch]);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Nom bo'yicha qidirish..." className="pl-9 h-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Holati" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="bo'sh">Bo'sh</SelectItem>
            <SelectItem value="band">Band</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branch} onValueChange={(v) => setBranch(v as BranchFilter)}>
          <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="Turi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="ich">ICH</SelectItem>
            <SelectItem value="wl">WL</SelectItem>
            <SelectItem value="tm">TM</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-gradient-brand" onClick={onTm}>
            <Plus className="h-4 w-4" /> TM qo'shish
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={onWl}>
            <Download className="h-4 w-4" /> WL import
          </Button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-12">No</th>
            <th>Nomi</th>
            <th>Turi</th>
            <th>Holati</th>
            <th>Miqdori</th>
            <th>O'lchov</th>
            <th>Min</th>
            <th className="text-right">Narx (so'm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} className="text-center text-muted-foreground py-8">Hech narsa topilmadi</td></tr>
          )}
          {rows.map((r, idx) => {
            const low = r.stock < r.min;
            return (
              <tr key={r.id}>
                <td className="text-muted-foreground">{idx + 1}</td>
                <td className="font-medium">{r.name}</td>
                <td><BranchBadge branch={r.branch} /></td>
                  <td><StatusPill s={r.status as UIProductStatus} /></td>
                <td className={cn("font-semibold tabular-nums", low && "text-destructive")}>
                  {low && <AlertCircle className="inline h-3 w-3 mr-1" />}
                  {formatNumber(r.stock)}
                </td>
                <td className="text-muted-foreground">{r.unit}</td>
                <td className="text-muted-foreground tabular-nums">{formatNumber(r.min)}</td>
                <td className="text-right tabular-nums">{r.price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t text-xs text-muted-foreground">{rows.length} ta yozuv</div>
    </div>
  );
}

function RawTab({ onImport }: { onImport: () => void }) {
  const navigate = useNavigate();
  const { data: rawTypes = [] } = useQuery({
    queryKey: ["raw-material-types"],
    queryFn: getRawMaterialTypes,
  });
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<"all" | "ich" | "wl">("all");

  const rows = useMemo(() => {
    const merged = rawTypes.map((t) => ({
      id: t.id,
      name: t.name,
      branch: t.type.toLowerCase() as "ich" | "wl",
      stock: t.currentStock,
      min: t.minStock,
      unit: t.unit,
      price: formatNumber(t.defaultPrice),
    }));

    return merged.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (branch !== "all" && r.branch !== branch) return false;
      return true;
    });
  }, [rawTypes, q, branch]);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Nom bo'yicha qidirish..." className="pl-9 h-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={branch} onValueChange={(v) => setBranch(v as "all" | "ich" | "wl")}>
          <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="Turi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="ich">ICH</SelectItem>
            <SelectItem value="wl">WL</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-gradient-brand" onClick={onImport}>
            <Plus className="h-4 w-4" /> Xomashiyo import
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/ombor/import-tarixi")}>
            <History className="h-4 w-4" /> Import tarixi
          </Button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-12">No</th>
            <th>Nomi</th>
            <th>Turi</th>
            <th>Miqdori</th>
            <th>O'lchov</th>
            <th>Narxi (so'm)</th>
            <th>Holat</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={7} className="text-center text-muted-foreground py-8">Hech narsa topilmadi</td></tr>
          )}
          {rows.map((r, idx) => {
            const low = r.stock < r.min;
            return (
              <tr key={r.id}>
                <td className="text-muted-foreground">{idx + 1}</td>
                <td className="font-medium">{r.name}</td>
                <td><BranchBadge branch={r.branch} /></td>
                <td className={cn("font-semibold tabular-nums", low && "text-destructive")}>{formatNumber(r.stock)}</td>
                <td className="text-muted-foreground">{r.unit}</td>
                <td className="tabular-nums">{r.price}</td>
                <td>
                  {low ? (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" /> Kam
                    </span>
                  ) : (
                    <span className="text-xs text-success">Yetarli</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t text-xs text-muted-foreground">{rows.length} ta yozuv</div>
    </div>
  );
}

export default function Ombor() {
  const [tmOpen, setTmOpen] = useState(false);
  const [wlOpen, setWlOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const products = useOmborStore((s) => s.products);
  const { data: rawTypes = [] } = useQuery({
    queryKey: ["raw-material-types"],
    queryFn: getRawMaterialTypes,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Ombor" subtitle="Tayyor mahsulot va xomashiyo qoldiqlari" showExport />
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Tayyor mahsulot ({products.length})</TabsTrigger>
          <TabsTrigger value="raw">Xomashiyo ({rawTypes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsTab onTm={() => setTmOpen(true)} onWl={() => setWlOpen(true)} /></TabsContent>
        <TabsContent value="raw"><RawTab onImport={() => setRawOpen(true)} /></TabsContent>
      </Tabs>

      <TmAddDialog open={tmOpen} onOpenChange={setTmOpen} />
      <WlImportDialog open={wlOpen} onOpenChange={setWlOpen} />
      <XomashiyoImportDialog open={rawOpen} onOpenChange={setRawOpen} />
    </div>
  );
}
