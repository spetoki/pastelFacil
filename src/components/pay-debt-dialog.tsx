"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Client, PaymentMethod } from "@/lib/types";
import { CircleDollarSign, CreditCard, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

type PayDebtDialogProps = {
  client: Client;
  onPayDebt: (
    clientId: string,
    amount: number,
    paymentMethod: PaymentMethod
  ) => Promise<void>;
  children: ReactNode;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const paymentOptions: { value: PaymentMethod; label: string, icon: React.FC<any> }[] = [
    { value: "Dinheiro", label: "Dinheiro", icon: CircleDollarSign },
    { value: "Pix", label: "Pix", icon: Landmark },
    { value: "Cartão", label: "Cartão", icon: CreditCard },
];

export function PayDebtDialog({
  client,
  onPayDebt,
  children,
}: PayDebtDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(client.debt);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Dinheiro");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (amount <= 0 || amount > client.debt) {
        toast({
            variant: "destructive",
            title: "Valor Inválido",
            description: `O valor do pagamento deve ser maior que zero e menor ou igual à dívida de ${formatCurrency(client.debt)}.`,
        });
        return;
    }

    setIsSubmitting(true);
    try {
      await onPayDebt(client.id, amount, paymentMethod);
      setOpen(false);
      // Reset state for next time
      setAmount(client.debt - amount); 
      setPaymentMethod("Dinheiro");
    } catch (error) {
        // Error toast is handled in the main page logic
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset state when closing dialog
        setAmount(client.debt);
        setPaymentMethod("Dinheiro");
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Pagar Dívida</DialogTitle>
          <DialogDescription>
            Cliente: <span className="font-semibold">{client.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="text-center">
                <p className="text-muted-foreground">Dívida Atual</p>
                <p className="text-3xl font-bold">{formatCurrency(client.debt)}</p>
            </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor a Pagar (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={client.debt}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
             <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="grid grid-cols-3 gap-4"
                >
                  {paymentOptions.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`pay-debt-${option.value}`}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3",
                          {
                            "border-primary": paymentMethod === option.value,
                            "border-muted": paymentMethod !== option.value,
                            "hover:bg-accent/50 hover:text-accent-foreground cursor-pointer": true,
                          }
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`pay-debt-${option.value}`}
                          className="sr-only"
                        />
                        <option.icon className="h-6 w-6" />
                        <span>{option.label}</span>
                      </Label>
                    )
                  )}
                </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting || amount <= 0}>
            {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
