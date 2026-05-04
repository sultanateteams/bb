import { rawMaterials } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";

export default function WLMaterialsTab() {
  const wlMaterials = rawMaterials.filter((m) => m.branch === "wl");

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nomi</th>
            <th className="text-right">Miqdori</th>
            <th>O'lchov birligi</th>
            <th className="text-right">Narxi</th>
            <th className="text-right">Jami qiymati</th>
          </tr>
        </thead>
        <tbody>
          {wlMaterials.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground py-8">
                Hech narsa topilmadi
              </td>
            </tr>
          )}
          {wlMaterials.map((m) => {
            const priceNum = parseInt(m.price.replace(/\s/g, ""));
            const total = m.stock * priceNum;
            return (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td className="text-right tabular-nums">{formatNumber(m.stock)}</td>
                <td className="text-muted-foreground">{m.unit}</td>
                <td className="text-right tabular-nums">{m.price} so'm</td>
                <td className="text-right tabular-nums">{formatNumber(total)} so'm</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}