import { PageHeader } from "@/components/PageHeader";
import { BranchBadge } from "@/components/Badges";
import { products, rawMaterials } from "@/lib/mockData";
import { MahsulotTurlari as MahsulotTurlariPage } from "./MahsulotTurlari/MahsulotTurlariPage";

export function MahsulotTurlari() {
  return <MahsulotTurlariPage />;
  return (
    <div className="space-y-6">
      <PageHeader title="Mahsulot turlari" subtitle="ICH, WL, TM mahsulotlar katalogi" showAdd addLabel="Mahsulot qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>Yo'nalish</th><th>Birlik</th><th>Min qoldiq</th><th className="text-right">Sotish narxi</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td><BranchBadge branch={p.branch} /></td>
                <td>{p.unit}</td>
                <td className="tabular-nums text-muted-foreground">{p.min}</td>
                <td className="text-right tabular-nums font-medium">{p.price} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function XomashiyoTurlari() {
  return (
    <div className="space-y-6">
      <PageHeader title="Xomashiyo turlari" subtitle="ICH va WL xomashiyolari katalogi" showAdd addLabel="Xomashiyo qo'shish" />
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>Yo'nalish</th><th>Birlik</th><th>Min</th><th className="text-right">Standart narx</th></tr></thead>
          <tbody>
            {rawMaterials.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td><BranchBadge branch={p.branch} /></td>
                <td>{p.unit}</td>
                <td className="tabular-nums text-muted-foreground">{p.min}</td>
                <td className="text-right tabular-nums font-medium">{p.price} so'm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
