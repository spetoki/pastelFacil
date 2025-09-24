"use client";

import type { DailyClosure } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, CreditCard, Landmark, User, FileText } from "lucide-react";


type DailyClosuresHistoryProps = {
  closures: DailyClosure[];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

export function DailyClosuresHistory({ closures }: DailyClosuresHistoryProps) {
  if (closures.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center gap-4 text-muted-foreground">
        <FileText className="w-16 h-16" />
        <h2 className="text-xl font-semibold">Nenhum Relatório Encontrado</h2>
        <p>Ainda não há fechamentos de caixa registrados.</p>
        <p>Para gerar um relatório, vá para a aba "Fechamento" e finalize o dia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Fechamentos</CardTitle>
                <p className="text-muted-foreground">Consulte os resumos de cada dia de trabalho.</p>
            </CardHeader>
        </Card>
        <Accordion type="single" collapsible className="w-full">
        {closures.map((closure) => (
            <AccordionItem value={closure.id} key={closure.id}>
            <AccordionTrigger>
                <div className="flex justify-between w-full pr-4 items-center">
                <div className="flex flex-col text-left">
                    <span className="font-semibold text-lg">Fechamento de {formatDate(closure.date)}</span>
                    <span className="text-sm text-muted-foreground">Faturamento Total: {formatCurrency(closure.totalRevenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={closure.difference === 0 ? "secondary" : "destructive"}>
                        Diferença: {formatCurrency(closure.difference)}
                    </Badge>
                </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-muted/50 rounded-md">
                    <h4 className="font-semibold mb-4 text-center">Resumo do Fechamento</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                       <FinancialCard
                          title="Vendas (Dinheiro)"
                          value={closure.totalByPaymentMethod["Dinheiro"] || 0}
                          icon={CircleDollarSign}
                        />
                        <FinancialCard
                          title="Vendas (Pix)"
                          value={closure.totalByPaymentMethod["Pix"] || 0}
                          icon={Landmark}
                        />
                        <FinancialCard
                          title="Vendas (Cartão)"
                          value={closure.totalByPaymentMethod["Cartão"] || 0}
                          icon={CreditCard}
                        />
                         <FinancialCard
                          title="Vendas (Fiado)"
                          value={closure.totalByPaymentMethod["Fiado"] || 0}
                          icon={User}
                        />
                         <FinancialCard
                          title="Entradas no Caixa"
                          value={closure.totalCashEntries}
                          icon={ArrowUpCircle}
                        />
                        <FinancialCard
                          title="Despesas / Retiradas"
                          value={closure.totalExpenses}
                          icon={ArrowDownCircle}
                        />
                         <InfoCard title="Faturamento Total" value={closure.totalRevenue} />
                         <InfoCard title="Valor Esperado (Dinheiro)" value={closure.expectedInCash} />
                         <InfoCard title="Valor Contado (Dinheiro)" value={closure.countedAmount} />
                         <InfoCard title="Diferença (Sobra/Falta)" value={closure.difference} isDifference />
                    </div>
                </div>
            </AccordionContent>
            </AccordionItem>
        ))}
        </Accordion>
    </div>
  );
}


const FinancialCard = ({ title, value, icon: Icon}: {
    title: string;
    value: number;
    icon: React.ElementType;
}) => (
    <div className={`flex flex-col gap-1 rounded-lg p-3 bg-background`}>
        <div className={`flex items-center gap-2 text-sm font-medium`}>
            <Icon className="h-4 w-4" />
            <span>{title}</span>
        </div>
        <p className={`text-xl font-bold`}>
            {formatCurrency(value)}
        </p>
    </div>
);

const InfoCard = ({ title, value, isDifference = false }: { title: string; value: number, isDifference?: boolean }) => (
    <div className={cn(
        "rounded-lg p-3 bg-background flex flex-col justify-between",
        isDifference && value > 0 ? "bg-blue-100 dark:bg-blue-900/20" : "",
        isDifference && value < 0 ? "bg-red-100 dark:bg-red-900/20" : "",
        isDifference && value === 0 ? "bg-green-100 dark:bg-green-900/20" : "",
    )}>
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-xl font-bold">{formatCurrency(value)}</span>
    </div>
)
