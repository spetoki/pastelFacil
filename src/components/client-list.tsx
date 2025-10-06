
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Trash } from "lucide-react";

type ClientListProps = {
  clients: Client[];
  onAddClient: (values: ClientFormValues) => Promise<void>;
  onDeleteClient: (clientId: string) => Promise<void>;
  isLoading: boolean;
};

function DeleteClientDialog({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: () => void;
}) {
  const [pin, setPin] = useState("");
  const [open, setOpen] = useState(false);
  const CORRECT_PIN = "2209";

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setPin("");
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Para excluir permanentemente o
            cliente <span className="font-semibold">{client.name}</span>, por
            favor, insira o PIN de proprietário.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label htmlFor={`pin-delete-${client.id}`}>PIN de Confirmação</Label>
          <Input
            id={`pin-delete-${client.id}`}
            type="password"
            maxLength={4}
            placeholder="••••"
            className="text-center tracking-widest mt-2"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPin("")}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={pin !== CORRECT_PIN}
          >
            Sim, excluir cliente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ClientList({
  clients,
  onAddClient,
  onDeleteClient,
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
                <TableCell><Skeleton className="h-9 w-9 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.isPJ ? client.cnpj : client.cpf}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.isPJ ? client.sedeAddress : client.address}</TableCell>
                <TableCell className="text-right">
                  <DeleteClientDialog client={client} onDelete={() => onDeleteClient(client.id)} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

    