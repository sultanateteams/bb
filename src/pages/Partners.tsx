import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/Badges";
import { agents, drivers, dealers, shops } from "@/lib/mockData";
import { CEO as CEOComponent } from "./CEO";

export function CEO() {
  return <CEOComponent />;
}

export function Diler() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dilerlar" subtitle="Distribyutorlar katalogi" showAdd addLabel="Diler qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>INN</th><th>Hudud</th><th>Telefon</th><th className="text-right">Aylanma</th></tr></thead>
          <tbody>
            {dealers.map(d => (
              <tr key={d.id}>
                <td className="font-medium">{d.name}</td>
                <td className="font-mono text-xs">{d.inn}</td>
                <td>{d.region}</td>
                <td className="text-muted-foreground">{d.phone}</td>
                <td className="text-right tabular-nums font-medium">{d.turnover} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Dokon() {
  const tones = { retail: "default", dealer: "info", vip: "warning" } as const;
  return (
    <div className="space-y-6">
      <PageHeader title="Do'konlar" subtitle="Buyurtmachi do'konlar — kategoriya narxlash tizimini belgilaydi" showAdd addLabel="Do'kon qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Do'kon</th><th>Egasi</th><th>Kategoriya</th><th>Hudud</th><th>Telefon</th><th className="text-right">Qarz</th></tr></thead>
          <tbody>
            {shops.map(s => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.owner}</td>
                <td><StatusBadge status={s.category.toUpperCase()} tone={tones[s.category]} /></td>
                <td>{s.region}</td>
                <td className="text-muted-foreground">{s.phone}</td>
                <td className={`text-right tabular-nums ${s.debt !== "0" ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {s.debt === "0" ? "—" : `${s.debt} so'm`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SavdoVakili() {
  return (
    <div className="space-y-6">
      <PageHeader title="Savdo vakillari" subtitle="Buyurtma olib keluvchi agentlar va ularning foizi" showAdd addLabel="Agent qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>F.I.Sh</th><th>Telefon</th><th>Foiz</th><th>Buyurtmalar</th><th className="text-right">Aylanma</th><th>Holat</th></tr></thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td className="text-muted-foreground">{a.phone}</td>
                <td><span className="font-semibold">{a.commission}%</span></td>
                <td className="tabular-nums">{a.orders}</td>
                <td className="text-right tabular-nums font-medium">{a.total} so'm</td>
                <td><StatusBadge status={a.active ? "Faol" : "Faol emas"} tone={a.active ? "success" : "default"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Haydovchi() {
  return (
    <div className="space-y-6">
      <PageHeader title="Haydovchilar" subtitle="Yetkazib berish jamoasi (MVP 2 da buyurtmaga biriktiriladi)" showAdd addLabel="Haydovchi qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>F.I.Sh</th><th>Telefon</th><th>Mashina</th><th>Reyslar</th><th>Holat</th></tr></thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td className="font-medium">{d.name}</td>
                <td className="text-muted-foreground">{d.phone}</td>
                <td className="font-mono text-xs">{d.car}</td>
                <td className="tabular-nums">{d.trips}</td>
                <td><StatusBadge status="Faol" tone="success" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Sozlamalar() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sozlamalar" subtitle="Tizim parametrlari va valyuta kursi" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-1">Valyuta kursi</h3>
          <p className="text-xs text-muted-foreground mb-4">Admin tomonidan qo'lda yangilanadi</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">1 USD = </label>
              <input defaultValue="12 650" className="mt-1 w-full h-10 px-3 rounded-md border bg-background text-lg font-semibold tabular-nums" />
            </div>
            <button className="h-10 px-4 rounded-md bg-gradient-brand text-primary-foreground text-sm font-medium">Saqlash</button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-1">Kompaniya ma'lumotlari</h3>
          <p className="text-xs text-muted-foreground mb-4">Hisobotlarda ishlatiladi</p>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Nom</label><input defaultValue="Biznes Boshqaruv MChJ" className="mt-1 w-full h-10 px-3 rounded-md border bg-background" /></div>
            <div><label className="text-xs text-muted-foreground">INN</label><input defaultValue="304567890" className="mt-1 w-full h-10 px-3 rounded-md border bg-background font-mono" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
