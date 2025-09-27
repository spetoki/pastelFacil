"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = (initialStock = 0) => z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço não pode ser negativo." }),
  stock: z.coerce.number().int().min(initialStock, { message: `O estoque não pode ser menor que ${initialStock}.` }),
  barcode: z.string().min(1, { message: "O código de barras é obrigatório." }),
});

export type ProductFormValues = z.infer<ReturnType<typeof formSchema>>;

type AddProductFormProps = {
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: ProductFormValues;
};

export function AddProductForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: AddProductFormProps) {
  const isEditing = !!initialData;
  const currentStock = initialData?.stock || 0;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema(currentStock)),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      barcode: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const buttonText = initialData ? "Salvar Alterações" : "Salvar Item";
  const submittingButtonText = initialData ? "Salvando..." : "Adicionando...";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item (ex: Muda, Fertilizante)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Muda de Cacau CCN-51" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Uma breve descrição do item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} min={isEditing ? currentStock : 0}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras / SKU</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 7890123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingButtonText : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
