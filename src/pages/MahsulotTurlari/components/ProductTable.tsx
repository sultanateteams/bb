import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BranchBadge } from "@/components/Badges";
import { Product } from "../types";

interface Props {
  products: Product[];
  isLoading: boolean;
  onOpenDetail: (product: Product) => void;
}

const branchMap: Record<Product["type"], "ich" | "wl" | "tm"> = {
  ICH: "ich",
  WL: "wl",
  TM: "tm",
};

export function ProductTable({ products, isLoading, onOpenDetail }: Props) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nomi</TableHead>
            <TableHead>Turi</TableHead>
            <TableHead>O'lchov birligi</TableHead>
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
              </TableRow>
            ))
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Hech narsa topilmadi
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => (
              <TableRow key={product.id} className="hover:bg-muted/50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <BranchBadge branch={branchMap[product.type]} />
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {product.minStock} {product.unit}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onOpenDetail(product)}>
                    Batafsil
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
