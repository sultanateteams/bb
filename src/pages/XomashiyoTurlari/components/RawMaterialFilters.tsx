import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RawMaterialFilter } from "../types";

interface RawMaterialFiltersProps {
  filter: RawMaterialFilter;
  onFilterChange: (filter: RawMaterialFilter) => void;
  onAdd: () => void;
}

export function RawMaterialFilters({ filter, onFilterChange, onAdd }: RawMaterialFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Input
          placeholder="Xomashiyo nomi..."
          value={filter.search}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
          className="max-w-sm"
        />
        <Select
          value={filter.type}
          onValueChange={(value: 'ALL' | 'ICH' | 'WL') => onFilterChange({ ...filter, type: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Hammasi</SelectItem>
            <SelectItem value="ICH">ICH</SelectItem>
            <SelectItem value="WL">WL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAdd}>
        + Xomashiyo qo'shish
      </Button>
    </div>
  );
}