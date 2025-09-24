"use client";

import { useState } from "react";
import type { Client, PaymentMethod } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import type { ClientFormValues } from "./add-client-form";
import { AddClientDialog } from "./add-client-dialog";
import { PayDebtDialog } from "./pay-debt-dialog";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type ClientListProps = {
  clients: Client[];
  onAddClient: (values: ClientFormValues) => Promise<void>;
  onPayDebt: (clientId: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
  isLoading: boolean;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};


export function ClientList({
  clients,
  onAddClient,
  onPayDebt,
  isLoading,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar cliente por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <AddClientDialog onAddClient={onAddClient} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead className="text-right">Dívida</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow key={client.id} className={cn(client.debt > 0 && "bg-destructive/10")}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={client.debt > 0 ? "destructive" : "secondary"}>
                    {formatCurrency(client.debt || 0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {client.debt > 0 && (
                    <PayDebtDialog client={client} onPayDebt={onPayDebt}>
                      <Button size="sm">Pagar</Button>
                    </PayDebtDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
