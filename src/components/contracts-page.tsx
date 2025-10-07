
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Client } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSignature, PlusCircle, Trash } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";

type ContractsPageProps = {
  clients: Client[];
};

const contractSchema = z.object({
  contratanteId: z.string().min(1, { message: "Selecione um contratante." }),
  
  // Pessoa Física
  contratanteNomeCompleto: z.string().optional(),
  contratanteNacionalidade: z.string().optional(),
  contratanteEstadoCivil: z.string().optional(),
  contratanteProfissao: z.string().optional(),
  contratanteRg: z.string().optional(),
  contratanteCpf: z.string().optional(),
  contratanteAddress: z.string().optional(),
  contratanteTelefone: z.string().optional(),
  contratanteEmail: z.string().email({ message: "Formato de e-mail inválido." }).optional().or(z.literal('')),
  
  // Pessoa Jurídica
  contratanteIsPJ: z.boolean().default(false),
  contratanteRazaoSocial: z.string().optional(),
  contratanteCnpj: z.string().optional(),
  contratanteIE: z.string().optional(),
  contratanteSedeAddress: z.string().optional(),
  contratanteRepLegalNome: z.string().optional(),
  contratanteRepLegalDados: z.string().optional(),


  contratadoName: z.string().default("Viveiro Andurá"),
  contratadoRepresentante: z.string().default("SANDRA RITA BARTNIK QUARESMA"),
  contratadoRepresentanteId: z.string().default("680.584 SSP/RO"),
  contratadoRepresentanteCpf: z.string().default("761.158.872-91"),
  contratadoAddress: z.string().default("Avenida dos Lírios, nº 2793, bairro Embratel, CEP 76.966-294, Cidade Cacoal, Estado de Rondônia"),
  contratadoRenasem: z.string().default("RO-02010/2022"),
  contratadoLocalizacao: z.string().default("LH 13, Lote 29-B, Gleba 13, sentido Funai"),

  tipoDeMuda: z.enum(["enxertada", "enraizada"], { required_error: "Selecione o tipo de muda."}),
  clones: z.array(z.object({
    name: z.string().min(1, { message: "Nome do clone obrigatório."}),
    quantity: z.coerce.number().positive({ message: "Qtd. deve ser > 0"}),
  })).min(1, { message: "Adicione pelo menos um clone."}),
  
  valorTotal: z.coerce.number().positive(),
  valorUnitario: z.coerce.number().positive(),
  dataEntregaInicio: z.string().default("dezembro de 2025"),
  dataEntregaFim: z.string().default("abril de 2026"),

  prazoContratoMeses: z.coerce.number().positive().default(12),
  
  contractDate: z.string().min(1, { message: "A data do contrato é obrigatória."}),
  contractCity: z.string().min(2, { message: "A cidade é obrigatória." }),

  testemunha1Name: z.string().min(2, { message: "O nome da testemunha é obrigatório." }),
  testemunha1Rg: z.string().min(2, { message: "O RG da testemunha é obrigatório." }),
  testemunha2Name: z.string().min(2, { message: "O nome da testemunha é obrigatório." }),
  testemunha2Rg: z.string().min(2, { message: "O RG da testemunha é obrigatório." }),
});


type ContractFormValues = z.infer<typeof contractSchema>;

export function ContractsPage({ clients }: ContractsPageProps) {
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contratanteId: "",
      
      contratanteNomeCompleto: "",
      contratanteNacionalidade: "brasileiro(a)",
      contratanteEstadoCivil: "",
      contratanteProfissao: "Produtor Rural",
      contratanteRg: "",
      contratanteCpf: "",
      contratanteAddress: "",
      contratanteTelefone: "",
      contratanteEmail: "",

      contratanteIsPJ: false,
      contratanteRazaoSocial: "",
      contratanteCnpj: "",
      contratanteIE: "",
      contratanteSedeAddress: "",
      contratanteRepLegalNome: "",
      contratanteRepLegalDados: "",

      contratadoName: "Viveiro Andurá",
      contratadoRepresentante: "SANDRA RITA BARTNIK QUARESMA",
      contratadoRepresentanteId: "680.584 SSP/RO",
      contratadoRepresentanteCpf: "761.158.872-91",
      contratadoAddress: "Avenida dos Lírios, nº 2793, bairro Embratel, CEP 76.966-294, Cidade Cacoal, Estado de Rondônia",
      contratadoRenasem: "RO-02010/2022",
      contratadoLocalizacao: "LH 13, Lote 29-B, Gleba 13, sentido Funai",
      dataEntregaInicio: "dezembro de 2025",
      dataEntregaFim: "abril de 2026",
      prazoContratoMeses: 12,
      tipoDeMuda: "enxertada",
      clones: [{name: "", quantity: 1}],
      valorTotal: 0,
      valorUnitario: 0,
      contractDate: "",
      contractCity: "Cascavel",
      testemunha1Name: "",
      testemunha1Rg: "",
      testemunha2Name: "",
      testemunha2Rg: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "clones",
  });
  
  const contratanteIsPJ = form.watch("contratanteIsPJ");

  const handleGenerateContract = (values: ContractFormValues) => {
    const contratante = clients.find((c) => c.id === values.contratanteId);
    if (!contratante) return;

    const clonesHtml = values.clones.map(clone => `
      <tr>
        <td style="text-align: center; border: 1px solid black; padding: 5px;">${clone.quantity}</td>
        <td style="text-align: center; border: 1px solid black; padding: 5px;">${clone.name}</td>
      </tr>
    `).join('');

    const totalClones = values.clones.reduce((sum, clone) => sum + clone.quantity, 0);

    const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    const metadeValor = formatCurrency(values.valorTotal / 2);

    const objetoContratoTexto = values.tipoDeMuda === "enxertada" 
      ? "o fornecimento, pelo CONTRATADO ao CONTRATANTE, de mudas de cacau enxertado, conforme abaixo:"
      : "o fornecimento, pelo CONTRATADO ao CONTRATANTE, de mudas de cacau clonal enraizadas, conforme abaixo:";

    let contratanteHtml;
    let contratanteAssinatura;

    if(values.contratanteIsPJ) {
      contratanteHtml = `
        <p>
          <strong>CONTRATANTE:</strong> ${values.contratanteRazaoSocial || ""}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${values.contratanteCnpj || ""}, Inscrição Estadual/Municipal nº ${values.contratanteIE || 'não aplicável'}, com sede em ${values.contratanteSedeAddress || ""}, neste ato representada por ${values.contratanteRepLegalNome || ""}, (dados do representante: ${values.contratanteRepLegalDados || ""});
        </p>
      `;
      contratanteAssinatura = `
        <p style="margin-bottom: 0;">${values.contratanteRepLegalNome || ""}</p>
        <p style="margin-top: 0;">(Contratante)</p>
      `;
    } else {
        contratanteHtml = `
        <p>
            <strong>CONTRATANTE:</strong> ${values.contratanteNomeCompleto || ""}, ${values.contratanteNacionalidade || ""}, ${values.contratanteEstadoCivil || ""}, ${values.contratanteProfissao || ""}, portador do RG nº ${values.contratanteRg || ""} e inscrito no CPF nº ${values.contratanteCpf || ""}, com endereço declarado: ${values.contratanteAddress || ""}, telefone: ${values.contratanteTelefone || 'não informado'}, e-mail: ${values.contratanteEmail || 'não informado'}.
        </p>
        `;
        contratanteAssinatura = `
        <p style="margin-bottom: 0;">${values.contratanteNomeCompleto || ""}</p>
        <p style="margin-top: 0;">(Contratante)</p>
        `;
    }

    const contractHtml = `
      <html>
        <head>
          <title>Contrato de Fornecimento de Mudas Clonais de Cacau</title>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.5; margin: 40px; font-size: 12pt; }
            h1, h2 { text-align: center; font-size: 12pt; margin-bottom: 20px; text-transform: uppercase; font-weight: bold; }
            p { text-indent: 2em; text-align: justify; margin-bottom: 1em; }
            .no-indent { text-indent: 0; }
            .clausula { margin-bottom: 1em; }
            .clausula-title { font-weight: bold; text-align: center; text-indent: 0; margin-bottom: 0.5em;}
            .assinaturas { margin-top: 50px; text-align: center; }
            .assinatura-bloco { margin-top: 60px; display: inline-block; width: 80%; }
            .assinatura-linha { border-top: 1px solid black; padding-top: 5px; margin: 0 auto; width: 60%; }
          </style>
        </head>
        <body>
          <h2>CONTRATO DE FORNECIMENTO DE MUDAS CLONAIS DE CACAU</h2>
          <h1>IDENTIFICAÇÃO DAS PARTES CONTRATANTES</h1>
          
          ${contratanteHtml}

          <p>
            <strong>CONTRATADO:</strong> ${values.contratadoName} – Renasem nº ${values.contratadoRenasem}, localizado na ${values.contratadoLocalizacao}, aqui representado por ${values.contratadoRepresentante}, brasileira, casada, engenheira agrônoma e viveirista, Carteira de Identidade nº ${values.contratadoRepresentanteId}, CPF nº ${values.contratadoRepresentanteCpf}, residente na ${values.contratadoAddress}.
          </p>
          
          <p class="no-indent">
            As partes acima identificadas têm entre si justo e acertado o presente Contrato de Fornecimento de Mudas Clonais de Cacau, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.
          </p>
          
          <p class="clausula-title">DO OBJETO DO CONTRATO</p>
          <p><strong>Cláusula 1ª.</strong> ${objetoContratoTexto}</p>
          <table style="width: 50%; margin: 20px auto; border-collapse: collapse;">
            <thead style="font-weight: bold;">
              <tr>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">Quantidade</td>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">Clone</td>
              </tr>
            </thead>
            <tbody>
              ${clonesHtml}
            </tbody>
          </table>

          <p class="clausula-title">DA ENTREGA</p>
          <p><strong>Cláusula 2ª.</strong> As mudas deverão ser retiradas no viveiro após a avaliação e concordância do CONTRATANTE, devendo as mesmas estar em boas condições de desenvolvimento e sanidade, com soldadura do porta-enxerto consolidada e folhas maduras expandidas em número não inferior a 3 pares.</p>
          <p><strong>Cláusula 3ª.</strong> As mudas na entrega deverão estar separadas conforme o clone, em perfeito estado para plantio e livres de doenças ou pragas que prejudiquem seu desenvolvimento.</p>
          <p><strong>Cláusula 4ª.</strong> A entrega das mudas se realizará a partir de ${values.dataEntregaInicio} até ${values.dataEntregaFim}, de acordo com a ordem de pedidos, devendo o agendamento ser feito com antecedência mínima de 5 dias.</p>
          <p><strong>Cláusula 4ª-A.</strong> No ato da retirada, o CONTRATANTE assinará termo de entrega, declarando ter recebido as mudas em conformidade com as especificações técnicas deste contrato.</p>
          
          <p class="clausula-title">DO ATRASO POR FORÇA MAIOR</p>
          <p><strong>Cláusula 5ª.</strong> Não será considerada inadimplência da CONTRATADA o atraso na entrega das mudas quando decorrente de força maior ou caso fortuito, tais como catástrofes naturais, pragas, epidemias, incêndios, enchentes, acidentes, greves, restrições governamentais ou quaisquer outros fatos alheios à vontade da CONTRATADA.</p>
          <p class="no-indent"><strong>Parágrafo único:</strong> Também não será considerada inadimplência em caso de afastamento temporário por motivos de saúde devidamente comprovados por atestado ou laudo médico. Nesse caso, o prazo de entrega poderá ser prorrogado pelo período necessário à recuperação, desde que o CONTRATANTE seja comunicado da nova previsão de entrega. O prazo máximo de regularização será de 6 (seis) meses.</p>

          <p><strong>Cláusula 6ª.</strong> Caso as mudas sejam entregues não respeitando as especificações previstas na Cláusula 2ª, serão devolvidas ao CONTRATADO, que deverá repô-las por outras que atendam às especificações.</p>
          <p><strong>Cláusula 7ª.</strong> As despesas com transporte serão de responsabilidade do CONTRATANTE, devendo o veículo comportar adequadamente as mudas a fim de evitar danos.</p>

          <p class="clausula-title">DO CULTIVO</p>
          <p><strong>Cláusula 8ª.</strong> As mudas deverão ser cultivadas de acordo com as recomendações técnicas para a cultura do cacau, em solo corrigido, com disponibilidade hídrica, nutrição mineral adequada e manejo correto, garantindo pegamento mínimo de 80%.</p>
          <p><strong>Cláusula 9ª.</strong> O CONTRATANTE se responsabiliza por fornecer sombreamento provisório e sistema de irrigação para garantir o pegamento das mudas. Na ausência destes, o CONTRATADO não se responsabiliza por índices inferiores.</p>
          
          <p class="clausula-title">DA REMUNERAÇÃO</p>
          <p><strong>Cláusula 10ª.</strong> O CONTRATANTE pagará ao CONTRATADO a quantia total de ${formatCurrency(values.valorTotal)}, referente a ${totalClones} mudas de cacau clonal, sendo:</p>
          <p style="text-indent: 4em;">50% (${metadeValor}) na assinatura do contrato como adiantamento;</p>
          <p style="text-indent: 4em;">50% restantes (${metadeValor}) na entrega das mudas.</p>
          <p>Forma de pagamento: PIX ou transferência bancária para ${values.contratadoRepresentante}, CPF ${values.contratadoRepresentanteCpf}.</p>
          
          <p class="clausula-title">DO PRAZO</p>
          <p><strong>Cláusula 11ª.</strong> O contrato terá prazo de ${values.prazoContratoMeses} meses a partir da assinatura pelas partes, encerrando-se automaticamente ao final deste período.</p>
          
          <p class="clausula-title">DA RESCISÃO CONTRATUAL</p>
          <p><strong>Cláusula 12ª.</strong> Na hipótese de rescisão por iniciativa de qualquer das partes, aplica-se multa de 10% sobre o valor remanescente do contrato, acrescida de: Juros de 1% ao mês; Correção monetária pelo índice oficial vigente; Multa de mora de 2%, nos termos do Código de Defesa do Consumidor.</p>
          
          <p class="clausula-title">DO FORO</p>
          <p><strong>Cláusula 13ª.</strong> Para dirimir quaisquer controvérsias oriundas do contrato, as partes elegem o foro da comarca de Cacoal – Rondônia.</p>
          
          <p style="text-align: right; text-indent: 0; margin-top: 30px;">${values.contractCity}, ${new Date((values.contractDate || new Date().toISOString().split('T')[0]) + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>

          <div class="assinaturas">
            <div class="assinatura-bloco">
              <div class="assinatura-linha">
                <p style="margin-bottom: 0;">${values.contratadoRepresentante}</p>
                <p style="margin-top: 0;">(Contratado)</p>
              </div>
            </div>
            <div class="assinatura-bloco">
              <div class="assinatura-linha">
                 ${contratanteAssinatura}
              </div>
            </div>
            
            <p style="margin-top: 60px; font-weight: bold; text-indent: 0;">Testemunhas:</p>

            <div class="assinatura-bloco">
                <p style="margin-bottom: 0;">Nome: ________________________ RG: ________________________</p>
            </div>
            <div class="assinatura-bloco">
                <p style="margin-bottom: 0;">Nome: ________________________ RG: ________________________</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(contractHtml);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  };
  
  const onContratanteChange = (contratanteId: string) => {
    const contratante = clients.find((c) => c.id === contratanteId);
    if(contratante) {
      const isPJ = !!contratante.isPJ; // Force boolean
      form.setValue("contratanteIsPJ", isPJ);

      // Set values for both PF and PJ, ensuring no undefined values
      form.setValue("contratanteNomeCompleto", contratante.name || "");
      form.setValue("contratanteCpf", contratante.cpf || "");
      form.setValue("contratanteRg", contratante.rg || "");
      form.setValue("contratanteAddress", contratante.address || "");
      form.setValue("contratanteTelefone", contratante.phone || "");
      form.setValue("contratanteEmail", contratante.email || "");
      form.setValue("contratanteNacionalidade", contratante.nacionalidade || 'brasileiro(a)');
      form.setValue("contratanteEstadoCivil", contratante.estadoCivil || "");
      form.setValue("contratanteProfissao", contratante.profissao || 'Produtor Rural');

      form.setValue("contratanteRazaoSocial", contratante.razaoSocial || "");
      form.setValue("contratanteCnpj", contratante.cnpj || "");
      form.setValue("contratanteIE", contratante.ie || "");
      form.setValue("contratanteSedeAddress", contratante.sedeAddress || "");
      form.setValue("contratanteRepLegalNome", contratante.repLegalNome || contratante.name || "");
      form.setValue("contratanteRepLegalDados", contratante.repLegalDados || "");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature />
          Gerador de Contratos
        </CardTitle>
        <CardDescription>
          Preencha as informações abaixo para gerar um novo contrato de fornecimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleGenerateContract)}
            className="space-y-8"
          >
            {/* Contratado */}
            <Card>
              <CardHeader><CardTitle>Dados do Contratado (Vendedor)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contratadoName" render={({ field }) => ( <FormItem> <FormLabel>Nome Fantasia</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="contratadoRenasem" render={({ field }) => ( <FormItem> <FormLabel>Nº Renasem</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <FormField control={form.control} name="contratadoLocalizacao" render={({ field }) => ( <FormItem> <FormLabel>Localização</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="contratadoRepresentante" render={({ field }) => ( <FormItem> <FormLabel>Representante Legal</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contratadoRepresentanteCpf" render={({ field }) => ( <FormItem> <FormLabel>CPF do Representante</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="contratadoRepresentanteId" render={({ field }) => ( <FormItem> <FormLabel>RG do Representante</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <FormField control={form.control} name="contratadoAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço do Representante</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>
            
            {/* Contratante */}
             <Card>
              <CardHeader><CardTitle>Dados do Contratante (Comprador)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contratanteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione um Cliente Cadastrado</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => { field.onChange(value); onContratanteChange(value); }} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Puxar dados de um cliente..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name} - {client.isPJ ? client.cnpj : client.cpf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contratanteIsPJ"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Pessoa</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={String(field.value)}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="false" id="type-pf-contract" />
                            </FormControl>
                            <FormLabel htmlFor="type-pf-contract" className="font-normal">Pessoa Física</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="true" id="type-pj-contract" />
                            </FormControl>
                            <FormLabel htmlFor="type-pj-contract" className="font-normal">Pessoa Jurídica</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                {contratanteIsPJ ? (
                  // Campos Pessoa Jurídica
                  <div className="space-y-4">
                    <FormField control={form.control} name="contratanteRazaoSocial" render={({ field }) => ( <FormItem> <FormLabel>Razão Social</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="contratanteCnpj" render={({ field }) => ( <FormItem> <FormLabel>CNPJ</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="contratanteIE" render={({ field }) => ( <FormItem> <FormLabel>Inscrição Estadual/Municipal</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <FormField control={form.control} name="contratanteSedeAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço Completo da Sede</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="contratanteRepLegalNome" render={({ field }) => ( <FormItem> <FormLabel>Nome do Representante Legal</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="contratanteRepLegalDados" render={({ field }) => ( <FormItem> <FormLabel>Dados do Representante (CPF, RG)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                ) : (
                  // Campos Pessoa Física
                  <div className="space-y-4">
                    <FormField control={form.control} name="contratanteNomeCompleto" render={({ field }) => ( <FormItem> <FormLabel>Nome Completo (sem abreviações)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="contratanteNacionalidade" render={({ field }) => ( <FormItem> <FormLabel>Nacionalidade</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="contratanteEstadoCivil" render={({ field }) => ( <FormItem> <FormLabel>Estado Civil</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="contratanteProfissao" render={({ field }) => ( <FormItem> <FormLabel>Profissão</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="contratanteRg" render={({ field }) => ( <FormItem> <FormLabel>RG / Documento de Identificação</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="contratanteCpf" render={({ field }) => ( <FormItem> <FormLabel>CPF</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                     <FormField control={form.control} name="contratanteAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço Completo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contratanteTelefone" render={({ field }) => ( <FormItem> <FormLabel>Telefone</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="contratanteEmail" render={({ field }) => ( <FormItem> <FormLabel>E-mail</FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Objeto */}
            <Card>
              <CardHeader><CardTitle>Objeto do Contrato</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="tipoDeMuda"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Muda</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="enxertada" id="type-grafted" />
                            </FormControl>
                            <FormLabel htmlFor="type-grafted" className="font-normal">Muda Enxertada</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="enraizada" id="type-rooted" />
                            </FormControl>
                            <FormLabel htmlFor="type-rooted" className="font-normal">Muda Enraizada</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator/>
                 <div>
                    <FormLabel>Clones e Quantidades</FormLabel>
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end mb-2 mt-2">
                        <FormField
                          control={form.control}
                          name={`clones.${index}.name`}
                          render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Clone</FormLabel><FormControl><Input {...field} placeholder="Ex: PH16" /></FormControl><FormMessage /></FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`clones.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash/></Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ name: "", quantity: 1 })}
                    >
                      <PlusCircle className="mr-2"/>
                      Adicionar Clone
                    </Button>
                  </div>
              </CardContent>
            </Card>

             {/* Pagamento e Entrega */}
            <Card>
              <CardHeader><CardTitle>Valores e Prazos</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="valorTotal" render={({ field }) => ( <FormItem> <FormLabel>Valor Total (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="valorUnitario" render={({ field }) => ( <FormItem> <FormLabel>Valor Unitário (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="dataEntregaInicio" render={({ field }) => ( <FormItem> <FormLabel>Início da Entrega</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="dataEntregaFim" render={({ field }) => ( <FormItem> <FormLabel>Fim da Entrega</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="prazoContratoMeses" render={({ field }) => ( <FormItem> <FormLabel>Prazo do Contrato (meses)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
              </CardContent>
            </Card>
            
            {/* Assinaturas */}
             <Card>
              <CardHeader><CardTitle>Local e Testemunhas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="contractCity" render={({ field }) => ( <FormItem> <FormLabel>Cidade do Contrato</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="contractDate" render={({ field }) => ( <FormItem> <FormLabel>Data do Contrato</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="testemunha1Name" render={({ field }) => ( <FormItem> <FormLabel>Nome Testemunha 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="testemunha1Rg" render={({ field }) => ( <FormItem> <FormLabel>RG Testemunha 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="testemunha2Name" render={({ field }) => ( <FormItem> <FormLabel>Nome Testemunha 2</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="testemunha2Rg" render={({ field }) => ( <FormItem> <FormLabel>RG Testemunha 2</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
              </CardContent>
            </Card>


            <Button type="submit" className="w-full h-12">
              Gerar Contrato e Imprimir/PDF
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    