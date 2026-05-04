import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Factory, Package2, Recycle, Plus, ArrowDownToLine, AlertCircle } from "lucide-react";
import { useOmborStore } from "@/lib/omborStore";
import { ImportRawToIchDialog } from "@/components/ich/ImportRawToIchDialog";
import { NewBatchDialog } from "@/components/ich/NewBatchDialog";
import { MakulaturaDialog } from "@/components/ich/MakulaturaDialog";
import { formatNumber } from "@/lib/utils";
import type { AstatkaItem } from "@/lib/mockData";

export default function ICH() {
  const ichRaw = useOmborStore((s) => s.ichRaw);
  const batches = useOmborStore((s) => s.ichBatches);
  const astatka = useOmborStore((s) => s.astatka);

  const [importOpen, setImportOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [makOpen, setMakOpen] = useState(false);
  const [makItems, setMakItems] = useState<AstatkaItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const astatkaCount = useMemo(() => astatka.filter((a) => a.status === "Omborida").length, [astatka]);

  const stats = [
    { icon: Factory, label: "Bu oy partiyalar", value: String(batches.length), sub: "ta" },
    { icon: Package2, label: "Ishlab chiqarilgan", value: "18 420", sub: "dona" },
    { icon: Recycle, label: "Astatka (qoldiq)", value: String(astatkaCount), sub: "ta" },
  ];

  const toggleSel = (id: number) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const openMakSingle = (it: AstatkaItem) => { setMakItems([it]); setMakOpen(true); };
  const openMakBatch = () => {
    const items = astatka.filter((a) => selected.includes(a.id) && a.status === "Omborida");
    if (items.length < 2) return;
    setMakItems(items);
    setMakOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="ICH — Ishlab chiqarish" subtitle="Xomashiyodan tayyor mahsulot chiqarish jarayoni" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-primary-muted text-primary flex items-center justify-center">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-xl font-semibold">{s.value} <span className="text-xs text-muted-foreground font-normal">{s.sub}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 1: ICH Xomashiyo Ombori */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 pb-3 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">ICH Xomashiyo Ombori</h3>
            <p className="text-xs text-muted-foreground mt-1">ICH ishlab chiqarishiga ajratilgan xomashiyolar</p>
          </div>
          <Button size="sm" className="gap-2 bg-gradient-brand hover:opacity-90" onClick={() => setImportOpen(true)}>
            <ArrowDownToLine className="h-4 w-4" /> Ombordan xomashiyo import
          </Button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>No</th><th>Nomi</th><th>Miqdori</th><th>O'lchov birligi</th><th>Holat</th></tr>
          </thead>
          <tbody>
            {ichRaw.map((r, idx) => {
              const ok = r.stock >= r.min;
              return (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{idx + 1}</td>
                  <td className="font-medium">{r.name}</td>
                  <td className="tabular-nums">{formatNumber(r.stock)}</td>
                  <td>{r.unit}</td>
                  <td>
                    {ok ? (
                      <StatusBadge status="Yetarli" tone="success" />
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        <StatusBadge status="Kam" tone="danger" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SECTION 2: Ishlab chiqarish partiyalari */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 pb-3 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">Ishlab chiqarish partiyalari</h3>
            <p className="text-xs text-muted-foreground mt-1">Asosiy ombordan ICH ga ko'chirish va export tarixi</p>
          </div>
          <Button size="sm" className="gap-2 bg-gradient-brand hover:opacity-90" onClick={() => setBatchOpen(true)}>
            <Plus className="h-4 w-4" /> Yangi partiya
          </Button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Partiya</th><th>Sana</th><th>Mahsulotlar</th><th>Tannarx</th><th>Astatka</th><th>Operator</th></tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className="font-mono text-xs font-semibold">{b.id}</td>
                <td>{b.date}</td>
                <td>{b.products}</td>
                <td className="font-medium tabular-nums">{b.cost} so'm</td>
                <td className="text-muted-foreground">{b.scrap}</td>
                <td className="text-muted-foreground">{b.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 3: Astatka */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 pb-3 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">Astatka (Qoldiqlar)</h3>
            <p className="text-xs text-muted-foreground mt-1">Ishlab chiqarishdan chiqqan qoldiqlar va makulatura</p>
          </div>
          <Button size="sm" variant="outline" disabled={selected.length < 2} onClick={openMakBatch}>
            Makulaturaga chiqarish (tanlangan)
          </Button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>No</th><th>Sana</th><th>Nomi</th><th>Miqdori</th><th>O'lchov birligi</th><th>Holati</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {astatka.map((a, idx) => {
              const inStore = a.status === "Omborida";
              return (
                <tr key={a.id}>
                  <td>
                    {inStore && (
                      <Checkbox checked={selected.includes(a.id)} onCheckedChange={() => toggleSel(a.id)} />
                    )}
                  </td>
                  <td className="text-muted-foreground">{idx + 1}</td>
                  <td>{a.date}</td>
                  <td className="font-medium">{a.name}</td>
                  <td className="tabular-nums">{formatNumber(a.qty)}</td>
                  <td>{a.unit}</td>
                  <td>
                    <StatusBadge status={a.status} tone={inStore ? "default" : "success"} />
                  </td>
                  <td>
                    {inStore && (
                      <Button size="sm" variant="outline" onClick={() => openMakSingle(a)}>
                        Makulaturaga chiqarish
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ImportRawToIchDialog open={importOpen} onOpenChange={setImportOpen} />
      <NewBatchDialog open={batchOpen} onOpenChange={setBatchOpen} />
      <MakulaturaDialog open={makOpen} onOpenChange={setMakOpen} items={makItems} onDone={() => setSelected([])} />
    </div>
  );
}
