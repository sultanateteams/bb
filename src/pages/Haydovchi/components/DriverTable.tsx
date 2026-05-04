import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { Driver } from "../types";

interface DriverTableProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function DriverTable({ drivers, onEdit, onDelete }: DriverTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Ismi</TableHead>
            <TableHead>Familiyasi</TableHead>
            <TableHead>Sharifi</TableHead>
            <TableHead>PINFL</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Mashina raqami</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Hali haydovchilar qo'shilmagan
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver, index) => (
              <TableRow key={driver.id} className="hover:bg-muted/50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{driver.firstName}</TableCell>
                <TableCell>{driver.lastName}</TableCell>
                <TableCell>{driver.middleName || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{driver.pinfl}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell className="font-mono">{driver.carPlate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(driver)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(driver)}>
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