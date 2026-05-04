import { PageHeader } from "@/components/PageHeader";
import { CEO as CEOComponent } from "./CEO";
import { Diler as DilerComponent } from "./Diler";
import { Dokon as DokonComponent } from "./Dokon";
import { SavdoVakili as SavdoVakiliComponent } from "./SavdoVakili";
import { Haydovchi as HaydovchiComponent } from "./Haydovchi";

export function CEO() {
  return <CEOComponent />;
}

export function Diler() {
  return <DilerComponent />;
}

export function Dokon() {
  return <DokonComponent />;
}

export function SavdoVakili() {
  return <SavdoVakiliComponent />;
}

export function Haydovchi() {
  return <HaydovchiComponent />;
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
