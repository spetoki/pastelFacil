"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProductForm, type ProductFormValues } from "./add-product-form";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

type EditProductDialogProps = {
  product: Product;
  onUpdateProduct: (
    productId: string,
    values: Partial<Omit<ProductFormValues, 'type'>>
  ) => Promise<void>;
  children: ReactNode;
};

export function EditProductDialog({
  product,
  onUpdateProduct,
  children,
}: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: Omit<ProductFormValues, 'type'>) => {
    setIsSubmitting(true);
    try {
      await onUpdateProduct(product.id, values);
      toast({
        title: "Sucesso!",
        description: `Item "${values.name}" atualizado.`,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o item.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData = {
    name: product.name,
    description: product.description,
    barcode: product.barcode,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Item</DialogTitle>
          <DialogDescription>
            Altere as informações do item abaixo.
          </DialogDescription>
        </DialogHeader>
        <AddProductForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
