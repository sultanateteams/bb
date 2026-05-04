import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { Employee } from "../types";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
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
            <TableHead>Lavozimi</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Hali xodimlar yo'q
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee, index) => (
              <TableRow key={employee.id} className="hover:bg-muted/50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{employee.firstName}</TableCell>
                <TableCell>{employee.lastName}</TableCell>
                <TableCell>{employee.middleName || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{employee.pinfl}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDelete(employee)}
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