import { PageHeader } from "@/components/PageHeader";
import { wlOps } from "@/lib/mockData";
import { StatusBadge } from "@/components/Badges";

export default function WL() {
  return (
    <div className="space-y-6">
      <PageHeader title="WL — White Label" subtitle="Materiallarni tashqi zavodga jo'natish va qabul qilish" showAdd addLabel="Yangi jo'natish" />

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr><th>WL ID</th><th>Sana</th><th>Mahsulot</th><th>Miqdor</th><th>Zavod</th><th>Holat</th><th className="text-right">Tannarx</th></tr>
          </thead>
          <tbody>
            {wlOps.map((w) => (
              <tr key={w.id}>
                <td className="font-mono text-xs font-semibold">{w.id}</td>
                <td>{w.date}</td>
                <td className="font-medium">{w.product}</td>
                <td className="tabular-nums">{w.qty} dona</td>
                <td className="text-muted-foreground">{w.factory}</td>
                <td><StatusBadge status={w.status} tone={w.status === "Qabul qilindi" ? "success" : "warning"} /></td>
                <td className="text-right tabular-nums">{w.cost} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
