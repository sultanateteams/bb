import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BranchBadge } from "@/components/Badges";
import { Pencil, Trash2 } from "lucide-react";
import type { RawMaterial } from "../types";

interface RawMaterialTableProps {
  materials: RawMaterial[];
  isLoading: boolean;
  onEdit: (material: RawMaterial) => void;
  onDelete: (material: RawMaterial) => void;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('uz-UZ') + " so'm";
};

const branchMap: Record<'ICH' | 'WL', 'ich' | 'wl'> = {
  ICH: 'ich',
  WL: 'wl',
};

export function RawMaterialTable({ materials, isLoading, onEdit, onDelete }: RawMaterialTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nomi</TableHead>
            <TableHead>O'lchov birligi</TableHead>
            <TableHead>Turi</TableHead>
            <TableHead>Standart narxi</TableHead>
            <TableHead>Minimum qoldiq</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index} className="animate-pulse">
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
                <TableCell className="h-10 bg-muted/50" />
              </TableRow>
            ))
          ) : materials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Hech narsa topilmadi
              </TableCell>
            </TableRow>
          ) : (
            materials.map((material, index) => (
              <TableRow key={material.id} className="hover:bg-muted/50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>
                  <BranchBadge branch={branchMap[material.type]} />
                </TableCell>
                <TableCell className="tabular-nums">{formatPrice(material.defaultPrice)}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {material.minStock} {material.unit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(material)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDelete(material)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}