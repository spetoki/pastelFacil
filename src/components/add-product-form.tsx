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
  "Verde e Amarelo",
  "Roxo e alaranjado",
];

const subOptions: Record<string, string[]> = {
  "Verde e Amarelo": ["EEOP 07", "EEOP 26", "EEOP 34", "EEOP 50", "EEOP 63", "EET 397", "CEPEC 2002"],
  "Roxo e alaranjado": ["BN 34", "CEPEC 2004", "CCN 51", "PH16", "PS 1319", "SJ 02"],
};

const formSchema = z.object({
  type: z.string().min(1, { message: "Selecione um tipo." }),
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  barcode: z.string().min(1, { message: "O código de barras é obrigatório." }),
}).refine(data => {
    if (data.type === 'Outro') {
        return data.name && data.name.length >= 2;
    }
    // If the type has sub-options, a name (from sub-options) must be selected
    if (subOptions[data.type] && subOptions[data.type].length > 0) {
        return data.name && data.name.length > 0;
    }
    return true;
}, {
    message: "Selecione um clone/variedade.",
    path: ["name"],
}).refine(data => {
    // This is for the "Other" text input case.
    if (data.type === 'Outro') {
        return data.name && data.name.length >= 2;
    }
    return true;
}, {
    message: "O nome personalizado deve ter pelo menos 2 caracteres.",
    path: ["name"],
});


export type ProductFormValues = z.infer<typeof formSchema>;

type AddProductFormProps = {
  onSubmit: (values: Omit<ProductFormValues, 'type'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<Omit<ProductFormValues, 'type'> & {name: string}>;
};

export function AddProductForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: AddProductFormProps) {
  const isEditing = !!initialData;

  const getInitialFormValues = () => {
    const defaultValues = {
      type: "",
      name: "",
      description: "",
      barcode: "",
    };

    if (initialData) {
        let type = "Outro";
        let name = initialData.name || "";
        
        // Find which predefined type this initial name belongs to
        for (const key in subOptions) {
            if (subOptions[key].includes(name)) {
                type = key;
                break;
            }
        }
        if (predefinedNames.includes(name)) {
            type = name;
        }

        return { ...defaultValues, ...initialData, type, name };
    }
    return defaultValues;
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormValues(),
  });
  
  const selectedType = form.watch("type");

  useEffect(() => {
    if (initialData) {
      form.reset(getInitialFormValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form]);
  
  useEffect(() => {
    // Reset name when type changes if it's a cascading type
    if (subOptions[selectedType]?.length > 0) {
        form.setValue("name", "");
    }
  }, [selectedType, form]);


  const handleFormSubmit = (values: ProductFormValues) => {
    let finalName = values.name;
    if (values.type !== 'Outro' && subOptions[values.type] && !subOptions[values.type].includes(values.name)) {
        finalName = values.type;
    }
    
    const submissionValues = {
        ...values,
        name: finalName,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...finalSubmission } = submissionValues;
    onSubmit(finalSubmission as Omit<ProductFormValues, 'type'>);
  }

  const buttonText = initialData ? "Salvar Alterações" : "Salvar Item";
  const submittingButtonText = initialData ? "Salvando..." : "Adicionando...";

  const currentSubOptions = subOptions[selectedType] || [];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Item</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        {currentSubOptions.length > 0 && (
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clone / Variedade</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a variedade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentSubOptions.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        
        {selectedType === 'Outro' && (
             <FormField
              control={form.control}
              name="name"
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
