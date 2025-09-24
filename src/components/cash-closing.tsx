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
  CircleDollarSign,
  CreditCard,
  Landmark,
  User,
  DollarSign,
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
    const todaysSales = sales;
    const todaysExpenses = expenses;
    const todaysCashEntries = cashEntries;

    const totalByPaymentMethod = todaysSales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalDinheiro = totalByPaymentMethod["Dinheiro"] || 0;
    const totalPix = totalByPaymentMethod["Pix"] || 0;
    const totalCartao = totalByPaymentMethod["Cartão"] || 0;
    const totalFiado = totalByPaymentMethod["Fiado"] || 0;

    const totalExpenses = todaysExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalCashEntries = todaysCashEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    // Saldo em caixa considera apenas dinheiro, pix e outras entradas, menos despesas.
    const finalBalance =
      totalDinheiro + totalPix + totalCashEntries - totalExpenses;

    return {
      todaysSales,
      todaysExpenses,
      todaysCashEntries,
      totalDinheiro,
      totalPix,
      totalCartao,
      totalFiado,
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
              Balanço das movimentações de hoje. O saldo em caixa considera
              apenas entradas imediatas (dinheiro, pix) e retiradas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vendas */}
            <FinancialCard
              title="Vendas (Dinheiro)"
              value={dailyData.totalDinheiro}
              icon={CircleDollarSign}
              color="text-green-800 dark:text-green-300"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <FinancialCard
              title="Vendas (Pix)"
              value={dailyData.totalPix}
              icon={Landmark}
              color="text-cyan-800 dark:text-cyan-300"
              bgColor="bg-cyan-50 dark:bg-cyan-900/20"
            />
            <FinancialCard
              title="Vendas (Cartão)"
              value={dailyData.totalCartao}
              icon={CreditCard}
              color="text-orange-800 dark:text-orange-300"
              bgColor="bg-orange-50 dark:bg-orange-900/20"
            />
             <FinancialCard
              title="Vendas (Fiado)"
              value={dailyData.totalFiado}
              icon={User}
              color="text-yellow-800 dark:text-yellow-300"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />

            {/* Movimentações de Caixa */}
            <FinancialCard
              title="Entradas no Caixa"
              value={dailyData.totalCashEntries}
              icon={ArrowUpCircle}
              color="text-blue-800 dark:text-blue-300"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <FinancialCard
              title="Despesas / Retiradas"
              value={dailyData.totalExpenses}
              icon={ArrowDownCircle}
              color="text-red-800 dark:text-red-300"
              bgColor="bg-red-50 dark:bg-red-900/20"
            />
            
            {/* Saldo Final */}
             <div className="col-span-2 lg:col-span-3">
              <Separator className="my-4"/>
               <div className="flex flex-col gap-1 rounded-lg bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span>Saldo Final em Caixa</span>
                </div>
                <p className="text-3xl font-bold text-primary/90">
                  {formatCurrency(dailyData.finalBalance)}
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
            <CardTitle>Adicionar Transação Manual</CardTitle>
            <CardDescription>
              Registre uma nova despesa ou uma entrada de dinheiro avulsa (ex: troco inicial).
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

const FinancialCard = ({ title, value, icon: Icon, color, bgColor }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) => (
    <div className={`flex flex-col gap-1 rounded-lg p-4 ${bgColor}`}>
        <div className={`flex items-center gap-2 text-sm font-medium ${color.replace('text-', 'text-opacity-80 dark:text-opacity-80')}`}>
            <Icon className="h-4 w-4" />
            <span>{title}</span>
        </div>
        <p className={`text-2xl font-bold ${color}`}>
            {formatCurrency(value)}
        </p>
    </div>
);
