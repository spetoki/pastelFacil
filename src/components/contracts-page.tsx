"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";

type ContractsPageProps = {
  clients: Client[];
};

const contractSchema = z.object({
  sellerName: z.string().default("Sandra Bartnik"),
  sellerCpf: z.string().default("123.456.789-00 (fictício)"),
  sellerRg: z.string().default("1.234.567 SSP/EX (fictício)"),
  sellerAddress: z.string().default("Rua das Flores, nº 100, Bairro Jardim, Cidade Exemplo, Estado EX, CEP 00000-000 (fictício)"),
  buyerId: z.string().min(1, { message: "Selecione um comprador." }),
  objectVariety: z.string().min(2, { message: "A variedade é obrigatória." }),
  objectQuantity: z.coerce.number().positive(),
  objectHeight: z.coerce.number().positive(),
  objectAge: z.coerce.number().positive(),
  objectCondition: z.string().default("mudas em saquinhos, prontas para plantio, livres de pragas e em padrão fitossanitário adequado."),
  priceTotal: z.coerce.number().positive(),
  priceUnit: z.coerce.number().positive(),
  paymentSignal: z.coerce.number().min(0),
  paymentRest: z.coerce.number().min(0),
  deliveryAddress: z.string().min(5, { message: "O endereço de entrega é obrigatório." }),
  deliveryDeadline: z.coerce.number().positive(),
  warrantyDays: z.coerce.number().positive().default(15),
  breachPenalty: z.coerce.number().positive().default(10),
  contractDate: z.string(),
  contractCity: z.string().min(2, { message: "A cidade é obrigatória." }),
  witness1Name: z.string().min(2, { message: "O nome da testemunha é obrigatório." }),
  witness1Cpf: z.string().min(11, { message: "O CPF da testemunha é obrigatório." }),
  witness2Name: z.string().min(2, { message: "O nome da testemunha é obrigatório." }),
  witness2Cpf: z.string().min(11, { message: "O CPF da testemunha é obrigatório." }),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export function ContractsPage({ clients }: ContractsPageProps) {
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      sellerName: "Sandra Bartnik",
      sellerCpf: "123.456.789-00 (fictício)",
      sellerRg: "1.234.567 SSP/EX (fictício)",
      sellerAddress: "Rua das Flores, nº 100, Bairro Jardim, Cidade Exemplo, Estado EX, CEP 00000-000 (dados fictícios)",
      objectCondition: "mudas em saquinhos, prontas para plantio, livres de pragas e em padrão fitossanitário adequado.",
      warrantyDays: 15,
      breachPenalty: 10,
    },
  });

  const handleGenerateContract = (values: ContractFormValues) => {
    const buyer = clients.find((c) => c.id === values.buyerId);
    if (!buyer) return;

    const contractHtml = `
      <html>
        <head>
          <title>Contrato de Compra e Venda de Mudas de Cacau</title>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.5; margin: 40px; }
            h1 { text-align: center; font-size: 16px; }
            p { text-indent: 2em; text-align: justify; margin-bottom: 1em;}
            .clause { margin-bottom: 1em; }
            .clause-title { font-weight: bold; }
            .signatures { margin-top: 50px; }
            .signature-line { border-top: 1px solid black; width: 300px; margin-top: 40px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>CONTRATO DE COMPRA E VENDA DE MUDAS DE CACAU</h1>
          <p>Pelo presente instrumento particular de Contrato de Compra e Venda, de um lado:</p>
          <p><strong>VENDEDORA:</strong> ${values.sellerName}, brasileira, solteira, produtora rural, portadora do CPF nº ${values.sellerCpf}, RG nº ${values.sellerRg}, residente e domiciliada à ${values.sellerAddress}.</p>
          <p><strong>COMPRADOR:</strong> ${buyer.name}, brasileiro, casado, agricultor, portador do CPF nº ${buyer.cpf}, RG nº 7.654.321 SSP/EX (fictício), residente e domiciliado à ${buyer.address}.</p>
          <p>As partes acima qualificadas têm entre si justo e contratado o que segue, que mutuamente aceitam e outorgam:</p>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 1 — DO OBJETO</p>
            <p>O presente contrato tem por objeto a compra e venda de mudas de cacau (Theobroma cacao), da variedade ${values.objectVariety}, com as seguintes especificações:</p>
            <ul>
              <li>Quantidade: ${values.objectQuantity} mudas;</li>
              <li>Altura média: ${values.objectHeight} cm;</li>
              <li>Idade: ${values.objectAge} dias;</li>
              <li>Condição: ${values.objectCondition}.</li>
            </ul>
          </div>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 2 — DO PREÇO E FORMA DE PAGAMENTO</p>
            <p>O preço total ajustado é de R$ ${values.priceTotal.toFixed(2)} (correspondente a R$ ${values.priceUnit.toFixed(2)} por muda).</p>
            <p>Forma de pagamento:<br/>
            a) R$ ${values.paymentSignal.toFixed(2)} a título de sinal na assinatura deste contrato;<br/>
            b) R$ ${values.paymentRest.toFixed(2)} no ato da entrega das mudas, via transferência bancária (PIX).</p>
          </div>
          
          <div class="clause">
            <p class="clause-title">CLÁUSULA 3 — DA ENTREGA</p>
            <p>A entrega das mudas será realizada no endereço do COMPRADOR, sito à ${values.deliveryAddress}, no prazo máximo de ${values.deliveryDeadline} dias corridos contados da assinatura deste contrato.</p>
            <p>Os custos de transporte e frete ficam sob responsabilidade da VENDEDORA, já inclusos no preço total.</p>
          </div>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 4 — DA RESPONSABILIDADE E GARANTIA</p>
            <p>4.1 A VENDEDORA declara que as mudas entregues estarão em condições normais de cultivo, livres de pragas e doenças aparentes.</p>
            <p>4.2 A VENDEDORA garante a qualidade das mudas por ${values.warrantyDays} dias após a entrega, desde que mantidas em condições adequadas de plantio.</p>
            <p>4.3 Não serão cobertas por garantia perdas ocasionadas por manejo inadequado, transporte indevido após a entrega, pragas ou doenças posteriores, fatores climáticos ou má conservação por parte do COMPRADOR.</p>
          </div>
          
          <div class="clause">
            <p class="clause-title">CLÁUSULA 5 — OBRIGAÇÕES DAS PARTES</p>
            <p>a) VENDEDORA: fornecer as mudas conforme descrito, dentro do prazo acordado, e prestar orientações básicas de plantio, se solicitado.</p>
            <p>b) COMPRADOR: efetuar o pagamento integral nas condições estipuladas, receber as mudas no prazo combinado e zelar pelo plantio e manejo após a entrega.</p>
          </div>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 6 — TRANSFERÊNCIA DE PROPRIEDADE</p>
            <p>A propriedade das mudas será transferida ao COMPRADOR somente após a entrega e quitação integral do preço.</p>
          </div>
          
          <div class="clause">
            <p class="clause-title">CLÁUSULA 7 — RESCISÃO E MULTA</p>
            <p>7.1 Em caso de inadimplemento contratual por qualquer das partes, a parte prejudicada poderá rescindir o contrato mediante notificação prévia de 90 (noventa) dias para regularização.</p>
            <p>7.2 Caso a irregularidade não seja sanada dentro do prazo estipulado, o contrato será rescindido e a parte inadimplente deverá pagar à parte prejudicada multa equivalente a ${values.breachPenalty}% do valor restante do contrato, além de eventuais perdas e danos comprovados.</p>
          </div>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 8 — DISPOSIÇÕES GERAIS</p>
            <p>8.1 Este contrato é firmado em caráter irrevogável e irretratável, obrigando herdeiros e sucessores.</p>
            <p>8.2 Alterações somente terão validade se realizadas por escrito e assinadas por ambas as partes.</p>
          </div>

          <div class="clause">
            <p class="clause-title">CLÁUSULA 9 — FORO</p>
            <p>Fica eleito o foro da Comarca de ${values.contractCity}, para dirimir quaisquer litígios oriundos deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">E, por estarem assim justas e contratadas, as partes assinam este instrumento em duas vias de igual teor e forma, juntamente com duas testemunhas.</p>

          <p style="text-align: center; margin-top: 30px;">${values.contractCity}, ${new Date(values.contractDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>

          <div class="signatures">
            <div class="signature-line">
              <p>${values.sellerName}</p>
              <p>CPF: ${values.sellerCpf}</p>
              <p>VENDEDORA</p>
            </div>
            <div class="signature-line">
              <p>${buyer.name}</p>
              <p>CPF: ${buyer.cpf}</p>
              <p>COMPRADOR</p>
            </div>
            <div class="signature-line">
              <p>Nome: ${values.witness1Name}</p>
              <p>CPF: ${values.witness1Cpf}</p>
              <p>Testemunha 1</p>
            </div>
            <div class="signature-line">
              <p>Nome: ${values.witness2Name}</p>
              <p>CPF: ${values.witness2Cpf}</p>
              <p>Testemunha 2</p>
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
  
  const onBuyerChange = (buyerId: string) => {
    const buyer = clients.find((c) => c.id === buyerId);
    if(buyer) {
      form.setValue("deliveryAddress", buyer.address);
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
          Preencha as informações abaixo para gerar um novo contrato de compra e
          venda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleGenerateContract)}
            className="space-y-8"
          >
            {/* Vendedor */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Vendedora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="sellerName" render={({ field }) => ( <FormItem> <FormLabel>Nome</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="sellerCpf" render={({ field }) => ( <FormItem> <FormLabel>CPF</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="sellerRg" render={({ field }) => ( <FormItem> <FormLabel>RG</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="sellerAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
              </CardContent>
            </Card>
            
            {/* Comprador */}
             <Card>
              <CardHeader>
                <CardTitle>Dados do Comprador</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="buyerId" render={({ field }) => ( <FormItem> <FormLabel>Selecione o Cliente</FormLabel> <Select onValueChange={(value) => { field.onChange(value); onBuyerChange(value); }} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione um cliente cadastrado" /> </SelectTrigger> </FormControl> <SelectContent> {clients.map(client => ( <SelectItem key={client.id} value={client.id}>{client.name} - {client.cpf}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

            {/* Objeto */}
            <Card>
              <CardHeader>
                <CardTitle>Objeto do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="objectVariety" render={({ field }) => ( <FormItem> <FormLabel>Variedade</FormLabel> <FormControl><Input {...field} placeholder="Ex: PS 1319" /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="objectQuantity" render={({ field }) => ( <FormItem> <FormLabel>Quantidade</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="objectHeight" render={({ field }) => ( <FormItem> <FormLabel>Altura (cm)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="objectAge" render={({ field }) => ( <FormItem> <FormLabel>Idade (dias)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <FormField control={form.control} name="objectCondition" render={({ field }) => ( <FormItem> <FormLabel>Condição</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

             {/* Pagamento e Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Preço, Pagamento e Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                   <FormField control={form.control} name="priceTotal" render={({ field }) => ( <FormItem> <FormLabel>Preço Total (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="priceUnit" render={({ field }) => ( <FormItem> <FormLabel>Preço Unitário (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="paymentSignal" render={({ field }) => ( <FormItem> <FormLabel>Sinal (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="paymentRest" render={({ field }) => ( <FormItem> <FormLabel>Restante (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <FormField control={form.control} name="deliveryAddress" render={({ field }) => ( <FormItem> <FormLabel>Endereço de Entrega</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="deliveryDeadline" render={({ field }) => ( <FormItem> <FormLabel>Prazo de Entrega (dias)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>
            
            {/* Cláusulas Finais e Assinaturas */}
             <Card>
              <CardHeader>
                <CardTitle>Cláusulas Finais e Assinaturas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="warrantyDays" render={({ field }) => ( <FormItem> <FormLabel>Garantia (dias)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="breachPenalty" render={({ field }) => ( <FormItem> <FormLabel>Multa por Rescisão (%)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="contractCity" render={({ field }) => ( <FormItem> <FormLabel>Cidade do Contrato</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                   <FormField control={form.control} name="contractDate" render={({ field }) => ( <FormItem> <FormLabel>Data do Contrato</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="witness1Name" render={({ field }) => ( <FormItem> <FormLabel>Nome Testemunha 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="witness1Cpf" render={({ field }) => ( <FormItem> <FormLabel>CPF Testemunha 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="witness2Name" render={({ field }) => ( <FormItem> <FormLabel>Nome Testemunha 2</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="witness2Cpf" render={({ field }) => ( <FormItem> <FormLabel>CPF Testemunha 2</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
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
