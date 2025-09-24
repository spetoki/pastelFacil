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
import { AddProductForm, type ProductFormValues } from "./add-product-form";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AddProductDialogProps = {
  onAddProduct: (values: ProductFormValues) => Promise<void>;
};

export function AddProductDialog({ onAddProduct }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddProduct(values);
      toast({
        title: "Sucesso!",
        description: `Produto "${values.name}" adicionado.`,
      });
      setOpen(false); // Fecha o diálogo em caso de sucesso
    } catch (error) {
      // O erro já é tratado na função principal, mas um toast aqui pode ser útil
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o produto.",
      });
    } finally {
      setIsSubmitting(false); // Garante que o estado de submissão seja resetado
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para cadastrar um novo item no sistema.
          </DialogDescription>
        </DialogHeader>
        <AddProductForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
