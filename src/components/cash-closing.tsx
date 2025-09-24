"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Sale, CashTransaction, DailyClosure } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  CreditCard,
  Landmark,
  User,
  DollarSign,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CashClosingProps = {
  sales: Sale[];
  expenses: CashTransaction[];
  cashEntries: CashTransaction[];
  onAddTransaction: (
    type: "expense" | "cashEntry",
    values: { description: string; amount: number }
  ) => Promise<void>;
  onCloseDay: (closureData: Omit<DailyClosure, 'id' | 'date'>) => Promise<void>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "short",
  }).format(date);
};

const transactionSchema = z.object({
  description: z.string().min(2, { message: "A descrição é obrigatória." }),
  amount: z.coerce
    .number()
    .positive({ message: "O valor deve ser positivo." }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function CashClosing({
  sales,
  expenses,
  cashEntries,
  onAddTransaction,
  onCloseDay,
}: CashClosingProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [isConferenceOpen, setIsConferenceOpen] = useState(false);
  const [countedAmount, setCountedAmount] = useState(0);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { description: "", amount: 0 },
  });

  const dailyData = useMemo(() => {
    const totalByPaymentMethod = sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalCashEntries = cashEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const totalRevenue = Object.values(totalByPaymentMethod).reduce(
      (sum, total) => sum + total,
      0
    );
    
    const revenueForClosure = (totalByPaymentMethod["Dinheiro"] || 0) + (totalByPaymentMethod["Pix"] || 0) + (totalByPaymentMethod["Cartão"] || 0);

    const expectedInCash = (totalByPaymentMethod["Dinheiro"] || 0) + totalCashEntries - totalExpenses;

    return {
      totalByPaymentMethod,
      totalExpenses,
      totalCashEntries,
      totalRevenue,
      revenueForClosure,
      expectedInCash,
    };
  }, [sales, expenses, cashEntries]);

  const handleFormSubmit = async (type: "expense" | "cashEntry", values: TransactionFormValues) => {
      setIsSubmitting(true);
      try {
        await onAddTransaction(type, values);
        form.reset();
      } catch (error) {
        // Toast de erro já é mostrado na função principal
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleConfirmCloseDay = async () => {
    setIsClosingDay(true);
    try {
      await onCloseDay({
        totalRevenue: dailyData.totalRevenue,
        totalByPaymentMethod: dailyData.totalByPaymentMethod,
        totalExpenses: dailyData.totalExpenses,
        totalCashEntries: dailyData.totalCashEntries,
        expectedInCash: dailyData.expectedInCash,
        countedAmount,
        difference: countedAmount - dailyData.revenueForClosure,
      });
      setIsConferenceOpen(false);
      setCountedAmount(0);
    } catch (error) {
      // Toast de erro já é mostrado na função principal
    } finally {
      setIsClosingDay(false);
    }
  }

  const difference = countedAmount - dailyData.revenueForClosure;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro do Turno</CardTitle>
            <CardDescription>
              Balanço de todas as movimentações do turno atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <FinancialCard
              title="Vendas (Dinheiro)"
              value={dailyData.totalByPaymentMethod["Dinheiro"] || 0}
              icon={CircleDollarSign}
              color="text-black"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <FinancialCard
              title="Vendas (Pix)"
              value={dailyData.totalByPaymentMethod["Pix"] || 0}
              icon={Landmark}
              color="text-black"
              bgColor="bg-cyan-50 dark:bg-cyan-900/20"
            />
            <FinancialCard
              title="Vendas (Cartão)"
              value={dailyData.totalByPaymentMethod["Cartão"] || 0}
              icon={CreditCard}
              color="text-black"
              bgColor="bg-orange-50 dark:bg-orange-900/20"
            />
            <FinancialCard
              title="Entradas no Caixa"
              value={dailyData.totalCashEntries}
              icon={ArrowUpCircle}
              color="text-black"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <FinancialCard
              title="Despesas / Retiradas"
              value={dailyData.totalExpenses}
              icon={ArrowDownCircle}
              color="text-black"
              bgColor="bg-red-50 dark:bg-red-900/20"
            />
            <FinancialCard
              title="Total de Vendas em Fiado"
              value={dailyData.totalByPaymentMethod["Fiado"] || 0}
              icon={User}
              color="text-black"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
            
             <div className="col-span-2 lg:col-span-3">
              <Separator className="my-4"/>
               <div className="flex flex-col gap-1 rounded-lg bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span>Faturamento Total do Turno (todas as formas de pag.)</span>
                </div>
                <p className="text-3xl font-bold text-primary/90">
                  {formatCurrency(dailyData.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Caixa Avulsas</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={cashEntries} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas e Retiradas</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={expenses} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações de Fechamento</CardTitle>
             <CardDescription>
              Use as opções abaixo para gerenciar as finanças do dia.
            </CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4">
              <Dialog open={isConferenceOpen} onOpenChange={setIsConferenceOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-12">
                    <Calculator className="mr-2" />
                    Finalizar Dia e Conferir Caixa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Conferência de Fechamento</DialogTitle>
                    <DialogDescription>
                      Confira os valores com base no faturamento do turno (sem fiado).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                      <span className="font-medium">Faturamento do Turno para Conferência</span>
                      <span className="font-bold text-lg">{formatCurrency(dailyData.revenueForClosure)}</span>
                    </div>

                     <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div>
                            <p className="text-muted-foreground">Dinheiro</p>
                            <p className="font-medium">{formatCurrency(dailyData.totalByPaymentMethod['Dinheiro'] || 0)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Pix</p>
                            <p className="font-medium">{formatCurrency(dailyData.totalByPaymentMethod['Pix'] || 0)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Cartão</p>
                            <p className="font-medium">{formatCurrency(dailyData.totalByPaymentMethod['Cartão'] || 0)}</p>
                        </div>
                    </div>
                    <Separator/>

                     <div className="space-y-2">
                       <Label htmlFor="counted-amount">Valor para Conferência (R$)</Label>
                       <Input
                         id="counted-amount"
                         type="number"
                         placeholder="0,00"
                         step="0.01"
                         value={countedAmount > 0 ? countedAmount : ""}
                         onChange={(e) => setCountedAmount(Number(e.target.value))}
                         className="text-lg text-right h-12"
                       />
                     </div>
                     <div className={cn("flex justify-between items-center p-3 rounded-md", 
                        countedAmount > 0 && difference === 0 ? "bg-green-100 dark:bg-green-900/20" : "",
                        countedAmount > 0 && difference !== 0 ? "bg-red-100 dark:bg-red-900/20" : ""
                     )}>
                        <span className="font-medium">Diferença</span>
                        <span className="font-bold text-lg">{formatCurrency(difference)}</span>
                     </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isClosingDay}>Fechar</Button>
                    </DialogClose>
                     <Button type="button" onClick={handleConfirmCloseDay} disabled={isClosingDay || countedAmount <= 0}>
                      {isClosingDay ? "Finalizando..." : "Confirmar e Fechar Dia"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </CardContent>
        </Card>
      
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Transação Manual</CardTitle>
            <CardDescription>
              Registre uma nova despesa ou uma entrada de dinheiro avulsa (ex: troco inicial).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Compra de guardanapos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={form.handleSubmit((values) => handleFormSubmit("cashEntry", values))}
              disabled={!form.formState.isValid || isSubmitting}
              className="flex-1"
              variant="secondary"
            >
              <ArrowUpCircle className="mr-2" />
              Registrar Entrada
            </Button>
            <Button
              onClick={form.handleSubmit((values) => handleFormSubmit("expense", values))}
              disabled={!form.formState.isValid || isSubmitting}
              className="flex-1"
              variant="destructive"
            >
              <ArrowDownCircle className="mr-2" />
              Registrar Despesa
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: CashTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma movimentação hoje.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{formatDate(t.date)}</TableCell>
            <TableCell>{t.description}</TableCell>
            <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const FinancialCard = ({ title, value, icon: Icon, color, bgColor }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) => (
    <div className={`flex flex-col gap-1 rounded-lg p-4 ${bgColor}`}>
        <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
            <Icon className="h-4 w-4" />
            <span>{title}</span>
        </div>
        <p className={`text-2xl font-bold ${color}`}>
            {formatCurrency(value)}
        </p>
    </div>
);