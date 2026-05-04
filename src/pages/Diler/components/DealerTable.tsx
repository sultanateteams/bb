import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { Dealer } from "../types";

interface DealerTableProps {
  dealers: Dealer[];
  onEdit: (dealer: Dealer) => void;
  onDelete: (dealer: Dealer) => void;
}

export function DealerTable({ dealers, onEdit, onDelete }: DealerTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Ismi</TableHead>
              <TableHead>Familiyasi</TableHead>
              <TableHead>Sharifi</TableHead>
              <TableHead>PINFL</TableHead>
              <TableHead>INN</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Tuman</TableHead>
              <TableHead>Ko'cha</TableHead>
              <TableHead>Manzil</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  Hali dilerlar qo'shilmagan
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer, index) => (
                <TableRow key={dealer.id} className="hover:bg-muted/50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{dealer.firstName}</TableCell>
                  <TableCell>{dealer.lastName}</TableCell>
                  <TableCell>{dealer.middleName || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{dealer.pinfl}</TableCell>
                  <TableCell>{dealer.inn}</TableCell>
                  <TableCell>{dealer.region}</TableCell>
                  <TableCell>{dealer.district}</TableCell>
                  <TableCell>{dealer.street || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{dealer.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(dealer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(dealer)}>
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
    </div>
  );
}