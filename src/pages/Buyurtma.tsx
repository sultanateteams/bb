import { PageHeader } from "@/components/PageHeader";
import { recentOrders } from "@/lib/mockData";
import { StatusBadge } from "@/components/Badges";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Buyurtma() {
  return (
    <div className="space-y-6">
      <PageHeader title="Buyurtmalar" subtitle="Agentlar va do'konlardan kelgan buyurtmalar" showAdd addLabel="Yangi buyurtma" showExport />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Hammasi</TabsTrigger>
          <TabsTrigger value="new">Yangi</TabsTrigger>
          <TabsTrigger value="ready">Tayyor</TabsTrigger>
          <TabsTrigger value="road">Yo'lda</TabsTrigger>
          <TabsTrigger value="done">Yetkazildi</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Sana</th><th>Do'kon</th><th>Agent</th><th>Summa</th><th>Holat</th><th>To'lov</th><th></th>
            </tr>
          </thead>
          <tbody>
            {[...recentOrders, ...recentOrders.map(o => ({ ...o, id: o.id.replace("B-2", "B-1") }))].map((o, i) => (
              <tr key={`${o.id}-${i}`}>
                <td className="font-mono text-xs font-semibold">{o.id}</td>
                <td className="text-muted-foreground">28.04.2026</td>
                <td className="font-medium">{o.shop}</td>
                <td>{o.agent}</td>
                <td className="font-semibold tabular-nums">{o.total} so'm</td>
                <td><StatusBadge status={o.status} tone={o.status === "Yetkazildi" ? "success" : o.status === "Yo'lda" ? "info" : o.status === "Yangi" ? "warning" : "default"} /></td>
                <td>{o.paid ? <StatusBadge status="To'langan" tone="success" /> : <StatusBadge status="Qarzdor" tone="danger" />}</td>
                <td className="text-right"><button className="text-xs text-primary hover:underline">Ko'rish</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
