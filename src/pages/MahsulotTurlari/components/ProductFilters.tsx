import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductFilter, ProductType } from "../types";

interface Props {
  filter: ProductFilter;
  onFilterChange: (filter: ProductFilter) => void;
  onAdd: () => void;
}

const types: Array<"ALL" | ProductType> = ["ALL", "ICH", "WL", "TM"];

export function ProductFilters({ filter, onFilterChange, onAdd }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            value={filter.search}
            onChange={(event) => onFilterChange({ ...filter, search: event.target.value })}
          />
        </div>

        <div className="w-full sm:w-[220px]">
          <Select
            value={filter.type}
            onValueChange={(value) => onFilterChange({ ...filter, type: value as ProductFilter["type"] })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Turi" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "ALL" ? "Hammasi" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex justify-end">
          <Button size="sm" className="bg-gradient-brand hover:opacity-90" onClick={onAdd}>
            Mahsulot qo'shish
          </Button>
        </div>
      </div>
    </div>
  );
}
