"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const predefinedNames = [
  "Muda de Cacau CCN-51",
  "Muda de Cacau CEPEC 2002",
  "EEOP 07",
  "EEOP 26",
  "EEOP 34",
  "EEOP 50",
  "EEOP 63",
  "EET 397",
];

const formSchema = (initialStock = 0) => z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  otherName: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço não pode ser negativo." }),
  stock: z.coerce.number().int().min(initialStock, { message: `O estoque não pode ser menor que ${initialStock}.` }),
  barcode: z.string().min(1, { message: "O código de barras é obrigatório." }),
}).refine(data => {
    if (data.name === 'Outro') {
        return data.otherName && data.otherName.length >= 2;
    }
    return true;
}, {
    message: "O nome personalizado deve ter pelo menos 2 caracteres.",
    path: ["otherName"],
});

export type ProductFormValues = z.infer<ReturnType<typeof formSchema>>;

type AddProductFormProps = {
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<ProductFormValues>;
};

export function AddProductForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: AddProductFormProps) {
  const isEditing = !!initialData;
  const currentStock = initialData?.stock || 0;

  const getInitialFormValues = () => {
    const defaultValues = {
      name: "",
      otherName: "",
      description: "",
      price: 0,
      stock: 0,
      barcode: "",
    };

    if (initialData) {
      const isPredefined = predefinedNames.includes(initialData.name || "");
      if (isPredefined) {
        return { ...defaultValues, ...initialData, name: initialData.name! };
      } else {
        return { ...defaultValues, ...initialData, name: 'Outro', otherName: initialData.name };
      }
    }
    return defaultValues;
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema(currentStock)),
    defaultValues: getInitialFormValues(),
  });

  const selectedName = form.watch("name");

  useEffect(() => {
    if (initialData) {
      form.reset(getInitialFormValues());
    }
  }, [initialData, form]);

  const handleFormSubmit = (values: ProductFormValues) => {
    const finalValues = { ...values };
    if (values.name === 'Outro') {
        finalValues.name = values.otherName || '';
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { otherName, ...submissionValues } = finalValues;
    onSubmit(submissionValues as ProductFormValues);
  }

  const buttonText = initialData ? "Salvar Alterações" : "Salvar Item";
  const submittingButtonText = initialData ? "Salvando..." : "Adicionando...";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {predefinedNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                  <SelectItem value="Outro">Outro (especificar)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Mudas Verde e amarelo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedName === 'Outro' && (
             <FormField
              control={form.control}
              name="otherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Personalizado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Adubo especial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}

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
