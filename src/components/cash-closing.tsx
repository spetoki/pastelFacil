"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Sale, CashTransaction, DailyClosure, Client, PaymentMethod } from "@/lib/types";
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
  Wallet,
  DollarSign,
  Calculator,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PayDebtDialog } from "./pay-debt-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";


type CashClosingProps = {
  sales: Sale[];
  fiadoSales: Sale[];
  expenses: CashTransaction[];
  cashEntries: CashTransaction[];
  debtPayments: CashTransaction[];
  clients: Client[];
  onAddTransaction: (
    type: "expense" | "cashEntry",
    values: { description: string; amount: number }
  ) => Promise<void>;
  onCloseDay: (closureData: Omit<DailyClosure, 'id' | 'date'>) => Promise<void>;
  onPayDebt: (clientId: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
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
  fiadoSales,
  expenses,
  cashEntries,
  debtPayments,
  clients,
  onAddTransaction,
  onCloseDay,
  onPayDebt
}: CashClosingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [isConferenceOpen, setIsConferenceOpen] = useState(false);
  const [isPayDebtOpen, setIsPayDebtOpen] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | undefined>();
  const [countedAmount, setCountedAmount] = useState(0);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { description: "", amount: 0 },
  });

  const dailyData = useMemo(() => {
    // Totals for the current shift (Dinheiro, Pix, Cartão)
    const shiftTotalByPaymentMethod = sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>
    );

    // Total for fiado sales for the whole day
    const totalFiadoToday = fiadoSales.reduce((sum, sale) => sum + sale.total, 0);

    const totalByPaymentMethod = {
      ...shiftTotalByPaymentMethod,
      "Fiado": totalFiadoToday,
    }

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalCashEntries = cashEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    const totalDebtPayments = debtPayments.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    
    // Total revenue of the shift (doesn't include fiado)
    const totalRevenue = sales
      .filter(sale => sale.paymentMethod !== 'Fiado')
      .reduce((sum, sale) => sum + sale.total, 0);

    // Revenue for cash closing (only what came in during the shift)
    const revenueForClosure = (shiftTotalByPaymentMethod["Dinheiro"] || 0) + (shiftTotalByPaymentMethod["Pix"] || 0) + (shiftTotalByPaymentMethod["Cartão"] || 0);

    const expectedInCash = (shiftTotalByPaymentMethod["Dinheiro"] || 0) + totalCashEntries + totalDebtPayments - totalExpenses;

    return {
      totalByPaymentMethod,
      totalExpenses,
      totalCashEntries,
      totalDebtPayments,
      totalRevenue,
      revenueForClosure,
      expectedInCash,
    };
  }, [sales, fiadoSales, expenses, cashEntries, debtPayments]);

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
      // The full revenue for the report includes shift sales + fiado sales for the day
      const fullTotalRevenue = Object.values(dailyData.totalByPaymentMethod).reduce((sum, total) => sum + total, 0);

      await onCloseDay({
        totalRevenue: fullTotalRevenue,
        totalByPaymentMethod: dailyData.totalByPaymentMethod,
        totalExpenses: dailyData.totalExpenses,
        totalCashEntries: dailyData.totalCashEntries,
        totalDebtPayments: dailyData.totalDebtPayments,
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

  const handleSelectClientForPayment = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClientForPayment(client);
  }

  const handleOpenPayDebtDialog = () => {
    if (selectedClientForPayment) {
      setIsPayDebtOpen(true);
    }
  }

  const difference = countedAmount - dailyData.revenueForClosure;

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
              title="Vendas (Fiado - Dia)"
              value={dailyData.totalByPaymentMethod["Fiado"] || 0}
              icon={User}
            />
            <FinancialCard
              title="Entradas no Caixa"
              value={dailyData.totalCashEntries}
              icon={ArrowUpCircle}
            />
            <FinancialCard
              title="Recebimentos (Fiado)"
              value={dailyData.totalDebtPayments}
              icon={Wallet}
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
         <Card>
            <CardHeader>
                <CardTitle>Recebimentos de Fiado</CardTitle>
                <CardDescription>Pagamentos de dívidas recebidos neste turno.</CardDescription>
            </CardHeader>
            <CardContent>
                <TransactionTable transactions={debtPayments} />
            </CardContent>
        </Card>
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
            <CardTitle>Ações do Cliente</CardTitle>
            <CardDescription>Receba pagamentos de dívidas de clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-select-payment">Selecionar Cliente</Label>
               <Select onValueChange={handleSelectClientForPayment} value={selectedClientForPayment?.id}>
                  <SelectTrigger id="client-select-payment">
                    <SelectValue placeholder="Escolha um cliente para pagar" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.filter(c => c.debt > 0).length > 0 ? (
                      clients.filter(c => c.debt > 0).map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex justify-between w-full">
                            <span>{client.name}</span>
                            <span className="text-muted-foreground">{formatCurrency(client.debt)}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum cliente com dívidas.
                      </div>
                    )}
                  </SelectContent>
                </Select>
            </div>
             <Button className="w-full" onClick={handleOpenPayDebtDialog} disabled={!selectedClientForPayment}>
                <Wallet className="mr-2"/>
                Receber Pagamento Fiado
            </Button>
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
    {selectedClientForPayment && (
        <Dialog open={isPayDebtOpen} onOpenChange={(isOpen) => {
          setIsPayDebtOpen(isOpen);
          if (!isOpen) setSelectedClientForPayment(undefined); // Reset client on close
        }}>
            <PayDebtDialog
                client={selectedClientForPayment}
                onPayDebt={onPayDebt}
            />
      </Dialog>
    )}
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
