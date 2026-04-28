import { PageHeader } from "@/components/PageHeader";
import { ichBatches } from "@/lib/mockData";
import { Factory, Package2, Recycle } from "lucide-react";

export default function ICH() {
  return (
    <div className="space-y-6">
      <PageHeader title="ICH — Ishlab chiqarish" subtitle="Xomashiyodan tayyor mahsulot chiqarish jarayoni" showAdd addLabel="Yangi partiya" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Factory, label: "Bu oy partiyalar", value: "42", sub: "ta" },
          { icon: Package2, label: "Ishlab chiqarilgan", value: "18 420", sub: "dona" },
          { icon: Recycle, label: "Astatka (makulatura)", value: "184", sub: "kg" },
        ].map((s) => (
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

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 pb-3 border-b">
          <h3 className="font-semibold">Ishlab chiqarish partiyalari</h3>
          <p className="text-xs text-muted-foreground mt-1">Asosiy ombordan ICH ga ko'chirish va export tarixi</p>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Partiya</th><th>Sana</th><th>Mahsulotlar</th><th>Tannarx</th><th>Astatka</th><th>Operator</th></tr>
          </thead>
          <tbody>
            {ichBatches.map((b) => (
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
    </div>
  );
}
