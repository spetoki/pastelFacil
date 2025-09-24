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
import Image from "next/image";
import { UploadCloud } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço não pode ser negativo." }),
  stock: z.coerce.number().int().min(0, { message: "O estoque não pode ser negativo." }),
  barcode: z.string().min(1, { message: "O código de barras é obrigatório." }),
  image: z
    .custom<FileList>()
    .refine((files) => files === undefined || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `O tamanho máximo da imagem é 5MB.`)
    .refine(
      (files) => files === undefined || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Apenas formatos .jpg, .jpeg, .png e .webp são aceitos."
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof formSchema>;

type AddProductFormProps = {
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Omit<ProductFormValues, "image"> & { imageUrl?: string };
};

export function AddProductForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: AddProductFormProps) {
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      barcode: "",
    },
  });

  const imageRef = form.register("image");

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stock: initialData.stock,
        barcode: initialData.barcode,
      });
      setPreview(initialData.imageUrl || null);
    }
  }, [initialData, form]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(initialData?.imageUrl || null);
    }
  };


  const buttonText = initialData ? "Salvar Alterações" : "Salvar Produto";
  const submittingButtonText = initialData ? "Salvando..." : "Adicionando...";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do Produto</FormLabel>
              <FormControl>
                <div className="w-full border-2 border-dashed border-muted-foreground/50 rounded-md aspect-video flex items-center justify-center relative">
                  {preview ? (
                     <Image
                        src={preview}
                        alt="Pré-visualização da imagem do produto"
                        fill
                        className="object-contain rounded-md"
                      />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                      <p>Arraste e solte ou clique para carregar</p>
                      <p className="text-xs">PNG, JPG, WEBP (máx. 5MB)</p>
                    </div>
                  )}
                  <Input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    {...imageRef}
                    onChange={handleImageChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pastel de Vento" {...field} />
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
                <Textarea placeholder="Uma breve descrição do produto" {...field} />
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
                  <Input type="number" step="1" {...field} />
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
              <FormLabel>Código de Barras</FormLabel>
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
