"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddClientForm, type ClientFormValues } from "./add-client-form";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AddClientDialogProps = {
  onAddClient: (values: ClientFormValues) => Promise<void>;
};

export function AddClientDialog({ onAddClient }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddClient(values);
      const clientName = values.name;
      toast({
        title: "Sucesso!",
        description: `Cliente "${clientName}" adicionado.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o cliente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para cadastrar um novo cliente. Apenas o nome é obrigatório.
          </DialogDescription>
        </DialogHeader>
        <AddClientForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
