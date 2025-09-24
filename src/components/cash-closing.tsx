"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Sale, CashTransaction } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type CashClosingProps = {
  sales: Sale[];
  expenses: CashTransaction[];
  cashEntries: CashTransaction[];
  onAddTransaction: (
    type: "expense" | "cashEntry",
    values: { description: string; amount: number }
  ) => void;
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
}: CashClosingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { description: "", amount: 0 },
  });

  const dailyData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();

    const todaysSales = sales.filter(
      (sale) => sale.date.getTime() >= startOfToday
    );
    const todaysExpenses = expenses.filter(
      (exp) => exp.date.getTime() >= startOfToday
    );
    const todaysCashEntries = cashEntries.filter(
      (entry) => entry.date.getTime() >= startOfToday
    );

    const totalRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = todaysExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalCashEntries = todaysCashEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const finalBalance = totalRevenue + totalCashEntries - totalExpenses;

    return {
      todaysSales,
      todaysExpenses,
      todaysCashEntries,
      totalRevenue,
      totalExpenses,
      totalCashEntries,
      finalBalance,
    };
  }, [sales, expenses, cashEntries]);

  const handleFormSubmit =
    (type: "expense" | "cashEntry") => async (values: TransactionFormValues) => {
      setIsSubmitting(true);
      await onAddTransaction(type, values);
      form.reset();
      setIsSubmitting(false);
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro do Dia</CardTitle>
            <CardDescription>
              Balanço das movimentações de hoje.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>Receita de Vendas</span>
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                {formatCurrency(dailyData.totalRevenue)}
              </p>
            </div>
             <div className="flex flex-col gap-1 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                <ArrowUpCircle className="h-4 w-4" />
                <span>Entradas no Caixa</span>
              </div>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {formatCurrency(dailyData.totalCashEntries)}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                <TrendingDown className="h-4 w-4" />
                <span>Despesas / Retiradas</span>
              </div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                {formatCurrency(dailyData.totalExpenses)}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <DollarSign className="h-4 w-4" />
                <span>Saldo em Caixa</span>
              </div>
              <p className="text-2xl font-bold text-primary/90">
                {formatCurrency(dailyData.finalBalance)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={dailyData.todaysCashEntries} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas e Retiradas</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={dailyData.todaysExpenses} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Transação</CardTitle>
            <CardDescription>
              Registre uma nova despesa ou entrada de dinheiro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
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
              onClick={form.handleSubmit(handleFormSubmit("cashEntry"))}
              disabled={isSubmitting}
              className="flex-1"
              variant="secondary"
            >
              <ArrowUpCircle className="mr-2" />
              Registrar Entrada
            </Button>
            <Button
              onClick={form.handleSubmit(handleFormSubmit("expense"))}
              disabled={isSubmitting}
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
