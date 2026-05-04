import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MapPin } from "lucide-react";
import type { Store } from "../types";

interface StoreTableProps {
  stores: Store[];
  onViewDetail: (store: Store) => void;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}

const categoryColors: Record<Store['category'], string> = {
  'Retail': 'bg-blue-100 text-blue-800',
  'Diler': 'bg-amber-100 text-amber-800',
  'VIP': 'bg-green-100 text-green-800',
};

export function StoreTable({ stores, onViewDetail, onEdit, onDelete }: StoreTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Do'kon nomi</TableHead>
              <TableHead>Egasi ismi</TableHead>
              <TableHead>Familiyasi</TableHead>
              <TableHead>PINFL</TableHead>
              <TableHead>INN</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Tuman</TableHead>
              <TableHead>Manzil</TableHead>
              <TableHead className="text-center">Geo</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  Hali do'konlar qo'shilmagan
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store, index) => (
                <TableRow key={store.id} className="hover:bg-muted/50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{store.storeName}</TableCell>
                  <TableCell>{store.ownerFirstName}</TableCell>
                  <TableCell>{store.ownerLastName}</TableCell>
                  <TableCell className="font-mono text-sm">{store.pinfl}</TableCell>
                  <TableCell>{store.inn}</TableCell>
                  <TableCell>{store.phone}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[store.category]}>{store.category}</Badge>
                  </TableCell>
                  <TableCell>{store.region}</TableCell>
                  <TableCell>{store.district}</TableCell>
                  <TableCell className="max-w-xs truncate">{store.address}</TableCell>
                  <TableCell className="text-center">
                    {store.geoLocation ? <MapPin className="h-4 w-4 text-green-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetail(store)}>
                        Batafsil
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(store)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(store)}>
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