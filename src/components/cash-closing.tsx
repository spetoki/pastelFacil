"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Sale, CashTransaction, DailyClosure, PaymentMethod } from "@/lib/types";
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
  DollarSign,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";


type CashClosingProps = {
  sales: Sale[];
  expenses: CashTransaction[];
  cashEntries: CashTransaction[];
  onAddTransaction: (
    type: "expense" | "cashEntry",
    values: { description: string; amount: number, paymentMethod?: PaymentMethod }
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
  paymentMethod: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const paymentOptions: { value: PaymentMethod; label: string, icon: React.FC<any> }[] = [
    { value: "Dinheiro", label: "Dinheiro", icon: CircleDollarSign },
    { value: "Pix", label: "Pix", icon: Landmark },
    { value: "Cartão", label: "Cartão", icon: CreditCard },
];

export function CashClosing({
  sales,
  expenses,
  cashEntries,
  onAddTransaction,
  onCloseDay,
}: CashClosingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [isConferenceOpen, setIsConferenceOpen] = useState(false);
  const [countedAmount, setCountedAmount] = useState(0);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { description: "", amount: 0, paymentMethod: "Dinheiro" },
  });

  const dailyData = useMemo(() => {
    // Totals for the current shift (Dinheiro, Pix, Cartão) from Sales
    const shiftSalesTotalByPayment = sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>
    );

    // Totals for cash entries (manual sales)
    const cashEntryTotalByPayment = cashEntries.reduce(
      (acc, entry) => {
        if (entry.paymentMethod) {
            acc[entry.paymentMethod] = (acc[entry.paymentMethod] || 0) + entry.amount;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    
    // Combine sales and cash entries totals
    const combinedTotalByPaymentMethod: Record<string, number> = {};
    const allPaymentMethods = new Set([...Object.keys(shiftSalesTotalByPayment), ...Object.keys(cashEntryTotalByPayment)]);

    allPaymentMethods.forEach(method => {
        combinedTotalByPaymentMethod[method] = (shiftSalesTotalByPayment[method] || 0) + (cashEntryTotalByPayment[method] || 0);
    });

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    // Cash entries that are just money input, not sales
    const totalCashEntries = cashEntries.filter(e => !e.paymentMethod).reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    
    // Total revenue of the shift
    const totalRevenue = Object.values(combinedTotalByPaymentMethod).reduce((sum, total) => sum + total, 0);


    // Revenue for cash closing (only what came in during the shift)
    const revenueForClosure = totalRevenue;

    const expectedInCash = (combinedTotalByPaymentMethod["Dinheiro"] || 0) + totalCashEntries - totalExpenses;

    return {
      totalByPaymentMethod: combinedTotalByPaymentMethod,
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
        await onAddTransaction(type, {
            ...values,
            paymentMethod: values.paymentMethod as PaymentMethod | undefined,
        });
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
        difference: countedAmount - dailyData.expectedInCash,
      });
      setIsConferenceOpen(false);
      setCountedAmount(0);
    } catch (error) {
      // Toast de erro já é mostrado na função principal
    } finally {
      setIsClosingDay(false);
    }
  }

  const difference = countedAmount - dailyData.expectedInCash;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro do Turno</CardTitle>
            <CardDescription>
              Balanço de todas as movimentações do turno atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialCard
              title="Vendas (Dinheiro)"
              value={dailyData.totalByPaymentMethod["Dinheiro"] || 0}
              icon={CircleDollarSign}
            />
            <FinancialCard
              title="Vendas (Pix)"
              value={dailyData.totalByPaymentMethod["Pix"] || 0}
              icon={Landmark}
            />
            <FinancialCard
              title="Vendas (Cartão)"
              value={dailyData.totalByPaymentMethod["Cartão"] || 0}
              icon={CreditCard}
            />
            <FinancialCard
              title="Entradas (Avulso)"
              value={dailyData.totalCashEntries}
              icon={ArrowUpCircle}
            />
            <FinancialCard
              title="Despesas / Retiradas"
              value={dailyData.totalExpenses}
              icon={ArrowDownCircle}
            />
            
             <div className="col-span-2 lg:col-span-4">
              <Separator className="my-4"/>
               <div className="flex flex-col gap-1 rounded-lg bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span>Faturamento do Turno (Dinheiro, Pix, Cartão)</span>
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
              <CardTitle>Vendas Manuais e Entradas</CardTitle>
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
                      Confira os valores em dinheiro com base nas movimentações do turno.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                      <span className="font-medium">Valor Esperado em Caixa</span>
                      <span className="font-bold text-lg">{formatCurrency(dailyData.expectedInCash)}</span>
                    </div>

                     <div className="space-y-2">
                       <Label htmlFor="counted-amount">Valor Contado em Caixa (R$)</Label>
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
              Registre uma despesa ou uma venda/entrada de caixa avulsa (ex: troco, venda sem item).
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
                 <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                     <FormItem>
                      <FormLabel>Forma de Pagamento (para Entradas/Vendas)</FormLabel>
                       <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-2"
                        >
                            {paymentOptions.map(opt => (
                                <FormItem key={opt.value}>
                                    <FormControl>
                                        <RadioGroupItem value={opt.value} id={`manual-${opt.value}`} className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor={`manual-${opt.value}`} className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground", field.value === opt.value && "border-primary")}>
                                        <opt.icon className="mb-1" />
                                        {opt.label}
                                    </Label>
                                </FormItem>
                            ))}
                        </RadioGroup>
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
              onClick={form.handleSubmit((values) => handleFormSubmit("expense", {...values, paymentMethod: undefined}))}
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
    </>
  );
}

function TransactionTable({ transactions }: { transactions: CashTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma movimentação neste turno.</p>;
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

const FinancialCard = ({ title, value, icon: Icon }: {
    title: string;
    value: number;
    icon: React.ElementType;
}) => (
    <div className="flex flex-col gap-1 rounded-lg p-4 bg-background">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
            {formatCurrency(value)}
        </p>
    </div>
);
