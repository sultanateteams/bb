import { PageHeader } from "@/components/PageHeader";
import { incomes } from "@/lib/mockData";

export default function Kirim() {
  return (
    <div className="space-y-6">
      <PageHeader title="Kirim" subtitle="Buyurtma to'lovlari va boshqa kirimlar" showAdd addLabel="Kirim qo'shish" showExport />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bugun</div><div className="text-xl font-semibold mt-1">33 500 000 so'm</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bu hafta</div><div className="text-xl font-semibold mt-1">142 800 000 so'm</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bu oy</div><div className="text-xl font-semibold mt-1">827 100 000 so'm</div></div>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Sana</th><th>Manba</th><th>Izoh</th><th>To'lov turi</th><th className="text-right">Summa</th></tr></thead>
          <tbody>
            {incomes.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td className="font-medium">{e.source}</td>
                <td className="text-muted-foreground">{e.note}</td>
                <td><span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-xs">{e.method}</span></td>
                <td className="text-right font-semibold tabular-nums text-success">+{e.amount} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
