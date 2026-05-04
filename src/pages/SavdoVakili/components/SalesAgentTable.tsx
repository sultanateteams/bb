import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { SalesAgent } from "../types";

interface SalesAgentTableProps {
  agents: SalesAgent[];
  onEdit: (agent: SalesAgent) => void;
  onDelete: (agent: SalesAgent) => void;
}

export function SalesAgentTable({ agents, onEdit, onDelete }: SalesAgentTableProps) {
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
              <TableHead>Telefon</TableHead>
              <TableHead>Foiz (%)</TableHead>
              <TableHead>Faol buyurtmalar</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Hali agentlar qo'shilmagan
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent, index) => (
                <TableRow key={agent.id} className="hover:bg-muted/50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{agent.firstName}</TableCell>
                  <TableCell>{agent.lastName}</TableCell>
                  <TableCell>{agent.middleName || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{agent.pinfl}</TableCell>
                  <TableCell>{agent.phone}</TableCell>
                  <TableCell className="text-right">{agent.commissionRate}%</TableCell>
                  <TableCell>{agent.activeOrders || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(agent)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(agent)}>
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