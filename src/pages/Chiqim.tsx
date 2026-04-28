import { PageHeader } from "@/components/PageHeader";
import { expenses } from "@/lib/mockData";

export default function Chiqim() {
  const total = expenses.reduce((s, e) => s + parseInt(e.amount.replace(/\s/g, ""), 10), 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Chiqim" subtitle="Barcha moliyaviy chiqimlar yagona joyda" showAdd addLabel="Chiqim qo'shish" showExport />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bugun</div><div className="text-xl font-semibold mt-1">6 900 000 so'm</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bu hafta</div><div className="text-xl font-semibold mt-1">{total.toLocaleString("ru-RU").replaceAll(",", " ")} so'm</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground">Bu oy</div><div className="text-xl font-semibold mt-1">214 800 000 so'm</div></div>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Sana</th><th>Turi</th><th>Izoh</th><th>Foydalanuvchi</th><th className="text-right">Summa</th></tr></thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td><span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-xs font-medium">{e.type}</span></td>
                <td className="text-muted-foreground">{e.note}</td>
                <td>{e.user}</td>
                <td className="text-right font-semibold tabular-nums text-destructive">-{e.amount} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
