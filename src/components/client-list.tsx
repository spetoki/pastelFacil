"use client";

import { useState } from "react";
import type { Client } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { ClientFormValues } from "./add-client-form";
import { AddClientDialog } from "./add-client-dialog";
import { Skeleton } from "./ui/skeleton";

type ClientListProps = {
  clients: Client[];
  onAddClient: (values: ClientFormValues) => Promise<void>;
  isLoading: boolean;
};

export function ClientList({
  clients,
  onAddClient,
  isLoading,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter((client) => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = client.name?.toLowerCase().includes(searchTermLower);
    const razaoSocialMatch = client.razaoSocial?.toLowerCase().includes(searchTermLower);
    const cpfMatch = client.cpf?.includes(searchTerm);
    const cnpjMatch = client.cnpj?.includes(searchTerm);
    return nameMatch || razaoSocialMatch || cpfMatch || cnpjMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar cliente por nome, CPF ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <AddClientDialog onAddClient={onAddClient} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome de Identificação</TableHead>
            <TableHead>CPF / CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
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
              </TableRow>
            ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.isPJ ? client.cnpj : client.cpf}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.isPJ ? client.sedeAddress : client.address}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
