
"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/lib/types";
import { Separator } from "./ui/separator";

type SaleReceiptDialogProps = {
  sale: Omit<Sale, "id">;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
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

// Componente para o Recibo que será impresso
const ReceiptContent = ({ sale }: { sale: Omit<Sale, "id"> }) => (
  <div className="font-mono text-xs text-black bg-white p-2">
    <div className="text-center space-y-1 mb-2">
      <h3 className="font-bold text-sm">Pastelaria Fácil</h3>
      <p>Rua da Pastelaria, 123 - Centro</p>
      <p>CNPJ: 12.345.678/0001-99</p>
      <p>--------------------------------</p>
      <p className="font-bold">CUPOM FISCAL</p>
      <p>--------------------------------</p>
    </div>
    <div className="mb-2">
      {sale.items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-1">
          <span className="col-span-6 truncate">{item.name}</span>
          <span className="col-span-2 text-right">{item.quantity}x</span>
          <span className="col-span-4 text-right">
            {formatCurrency(item.price)}
          </span>
        </div>
      ))}
    </div>
    <Separator className="my-2 border-dashed border-black" />
    <div className="space-y-1 text-sm">
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>{formatCurrency(sale.total)}</span>
      </div>
      <div className="flex justify-between">
        <span>Pagamento:</span>
        <span>{sale.paymentMethod}</span>
      </div>
       {sale.clientName && (
        <div className="flex justify-between">
          <span>Cliente:</span>
          <span>{sale.clientName}</span>
        </div>
      )}
    </div>
    <Separator className="my-2 border-dashed border-black" />
    <div className="text-center space-y-1">
      <p>{formatDate(sale.date)}</p>
      <p>Obrigado e volte sempre!</p>
    </div>
  </div>
);

export function SaleReceiptDialog({
  sale,
  onConfirm,
  onCancel,
  isSubmitting,
}: SaleReceiptDialogProps) {

  const handlePrint = async () => {
    await onConfirm();
    
    // Aguarda um instante para garantir que o estado seja atualizado antes de imprimir
    setTimeout(() => {
        const printWindow = window.open('', '', 'height=600,width=400');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Cupom</title>');
            // Inclui o CSS do Tailwind para impressão (simplificado)
            printWindow.document.write('<style>body { font-family: monospace; font-size: 10px; } .font-bold { font-weight: bold; } .text-center { text-align: center; } .text-right { text-align: right; } .flex { display: flex; } .justify-between { justify-content: space-between; } .grid { display: grid; } .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); } .col-span-6 { grid-column: span 6 / span 6; } .col-span-4 { grid-column: span 4 / span 4; } .col-span-2 { grid-column: span 2 / span 2; } .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; } .mb-2 { margin-bottom: 0.5rem; } .space-y-1 > * + * { margin-top: 0.25rem; } .border-dashed { border-style: dashed; } .border-black { border-color: #000; } </style>');
            printWindow.document.write('</head><body>');
            const receiptEl = document.getElementById('receipt-print-area');
            if (receiptEl) {
                printWindow.document.write(receiptEl.innerHTML);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }, 500);
  };

  useEffect(() => {
    // Quando o diálogo é aberto, o `sale` existe.
    // Se o `sale` se torna nulo (após a venda), o diálogo se fecha.
    if (!sale) {
      onCancel();
    }
  }, [sale, onCancel]);

  return (
    <Dialog open={!!sale} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comprovante de Venda</DialogTitle>
          <DialogDescription>
            Confira o comprovante abaixo. Deseja imprimir?
          </DialogDescription>
        </DialogHeader>
        <div id="receipt-print-area" className="p-4 bg-muted/50 rounded-md my-4">
           <ReceiptContent sale={sale} />
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Finalizando..." : "Finalizar sem Imprimir"}
          </Button>
          <Button type="button" onClick={handlePrint} disabled={isSubmitting}>
             {isSubmitting ? "Finalizando..." : "Finalizar e Imprimir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
