"use client";

import type { Sale } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type SalesHistoryProps = {
  sales: Sale[];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

export function SalesHistory({ sales }: SalesHistoryProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma venda ou retirada registrada hoje.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {sales.map((sale) => (
        <AccordionItem value={sale.id} key={sale.id}>
          <AccordionTrigger>
            <div className="flex justify-between w-full pr-4 items-center">
              <div className="flex flex-col text-left">
                <span className="font-semibold">Venda #{sale.id.slice(-6)}</span>
                <span className="text-sm text-muted-foreground">{formatDate(sale.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{sale.paymentMethod}</Badge>
                <Badge>{formatCurrency(sale.total)}</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qtd.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item, index) => (
                  <TableRow key={`${item.productId}-${index}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
