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
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod schema for client form validation
const formSchema = z.object({
  // Common fields
  name: z.string().min(2, { message: "O nome de identificação deve ter pelo menos 2 caracteres." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido." }).optional().or(z.literal('')),
  
  // Discriminator
  isPJ: z.boolean().default(false),

  // PF fields (optional)
  nacionalidade: z.string().optional(),
  estadoCivil: z.string().optional(),
  profissao: z.string().optional(),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),

  // PJ fields (optional)
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  ie: z.string().optional(),
  sedeAddress: z.string().optional(),
  repLegalNome: z.string().optional(),
  repLegalDados: z.string().optional(),
});


export type ClientFormValues = z.infer<typeof formSchema>;

type AddClientFormProps = {
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<ClientFormValues>;
};

export function AddClientForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: AddClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      email: "",
      isPJ: false,
      nacionalidade: "",
      estadoCivil: "",
      profissao: "",
      rg: "",
      cpf: "",
      address: "",
      razaoSocial: "",
      cnpj: "",
      ie: "",
      sedeAddress: "",
      repLegalNome: "",
      repLegalDados: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const isPJ = form.watch("isPJ");

  const buttonText = initialData ? "Salvar Alterações" : "Salvar Cliente";
  const submittingButtonText = initialData ? "Salvando..." : "Adicionando...";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="isPJ"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Cliente</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={String(field.value)}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="false" id="type-pf" />
                    </FormControl>
                    <FormLabel htmlFor="type-pf" className="font-normal">Pessoa Física</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="true" id="type-pj" />
                    </FormControl>
                    <FormLabel htmlFor="type-pj" className="font-normal">Pessoa Jurídica</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        
        <Separator />

        {isPJ ? (
          // ============== PJ FIELDS ==============
          <div className="space-y-4 animate-in fade-in-50">
             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome de Identificação (Apelido/Fantasia) <span className="text-destructive">*</span></FormLabel> <FormControl><Input placeholder="Nome para identificar a empresa" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="razaoSocial" render={({ field }) => ( <FormItem> <FormLabel>Razão Social</FormLabel> <FormControl><Input placeholder="Nome oficial da empresa" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cnpj" render={({ field }) => ( <FormItem> <FormLabel>CNPJ</FormLabel> <FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="ie" render={({ field }) => ( <FormItem> <FormLabel>Inscrição Estadual/Municipal</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
            <FormField control={form.control} name="sedeAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço Completo da Sede</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <Separator />
            <h3 className="text-sm font-medium text-muted-foreground">Dados do Representante</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="repLegalNome" render={({ field }) => ( <FormItem> <FormLabel>Nome do Representante</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="repLegalDados" render={({ field }) => ( <FormItem> <FormLabel>Documentos do Representante</FormLabel> <FormControl><Input placeholder="CPF, RG..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
          </div>
        ) : (
          // ============== PF FIELDS ==============
          <div className="space-y-4 animate-in fade-in-50">
             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome Completo <span className="text-destructive">*</span></FormLabel> <FormControl><Input placeholder="Nome completo do cliente" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
             <div className="grid md:grid-cols-3 gap-4">
                <FormField control={form.control} name="nacionalidade" render={({ field }) => ( <FormItem> <FormLabel>Nacionalidade</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="estadoCivil" render={({ field }) => ( <FormItem> <FormLabel>Estado Civil</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="profissao" render={({ field }) => ( <FormItem> <FormLabel>Profissão</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rg" render={({ field }) => ( <FormItem> <FormLabel>RG</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="cpf" render={({ field }) => ( <FormItem> <FormLabel>CPF</FormLabel> <FormControl><Input placeholder="Apenas números" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
             <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Endereço Completo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          </div>
        )}
        
        <Separator />
         <h3 className="text-sm font-medium text-muted-foreground">Informações de Contato</h3>
        <div className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Telefone</FormLabel> <FormControl><Input placeholder="(DD) 99999-9999" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-mail</FormLabel> <FormControl><Input type="email" placeholder="cliente@email.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
        </div>

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
