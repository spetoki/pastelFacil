"use client";

import type { CartItem, PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Barcode, Minus, Plus, ShoppingCart, Trash2, CreditCard, Landmark, CircleDollarSign } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SalesCartProps = {
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onFinalizeSale: (
    paymentMethod: PaymentMethod,
    overrideTotal?: number,
  ) => Promise<void>;
  onAddByBarcode: (barcode: string) => boolean;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function SalesCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onFinalizeSale,
  onAddByBarcode,
}: SalesCartProps) {
  const [barcode, setBarcode] = useState("");
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Dinheiro");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [manualTotal, setManualTotal] = useState<number | undefined>();


  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const total = manualTotal !== undefined ? manualTotal : calculatedTotal;
  
  useEffect(() => {
    // Reset manual total when cart items change
    setManualTotal(undefined);
  }, [items]);
  
  useEffect(() => {
    if (!isFinalizeDialogOpen) {
      setPaymentMethod("Dinheiro");
    }
  }, [isFinalizeDialogOpen]);


  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      const success = onAddByBarcode(barcode.trim());
      if (success) {
        setBarcode("");
      }
    }
  };

  const handleConfirmSale = async () => {
    setIsSubmitting(true);
    await onFinalizeSale(paymentMethod, total);
    setIsSubmitting(false);
    setIsFinalizeDialogOpen(false);
    setManualTotal(undefined);
  }

  const paymentOptions: { value: PaymentMethod; label: string, icon: React.FC<any> }[] = [
    { value: "Dinheiro", label: "Dinheiro", icon: CircleDollarSign },
  ];

  return (
    <>
      <div className="bg-card rounded-lg border h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Retirada Atual
          </h2>
        </div>

        <form onSubmit={handleBarcodeScan} className="p-4 space-y-2 border-b">
          <label htmlFor="barcode-input" className="text-sm font-medium">
            Leitor de Código de Barras
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="barcode-input"
                placeholder="Digite ou leia o código"
                className="pl-10"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground pt-16">
              <ShoppingCart className="mx-auto h-12 w-12" />
              <p className="mt-2">A lista de retirada está vazia</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              return (
                <div key={product.id} className="flex items-center gap-4">
                   <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                    </div>
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onUpdateQuantity(product.id, Math.max(1, quantity - 1))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="h-7 w-16 text-center"
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        onUpdateQuantity(product.id, newQuantity > 0 ? newQuantity : 1);
                      }}
                      onBlur={(e) => {
                        if (Number(e.target.value) <= 0) {
                          onUpdateQuantity(product.id, 1);
                        }
                      }}
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t mt-auto space-y-4">
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span>Total Calculado:</span>
              <span>{formatCurrency(calculatedTotal)}</span>
            </div>
             <div className="space-y-2">
              <Label htmlFor="manual-total">Total Manual (R$)</Label>
              <Input
                id="manual-total"
                type="number"
                placeholder="Deixar em branco para usar o total calculado"
                value={manualTotal === undefined ? "" : manualTotal}
                onChange={(e) => setManualTotal(e.target.value === "" ? undefined : Number(e.target.value))}
                className="text-right"
              />
            </div>
            <Separator />
             <div className="flex justify-between items-center text-xl font-semibold">
              <span>Total Final:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-base bg-accent hover:bg-accent/90 text-accent-foreground">
                  Finalizar Retirada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Finalizar Retirada</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-lg font-bold text-center">{formatCurrency(total)}</p>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="grid grid-cols-1 gap-4"
                  >
                    {paymentOptions.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4",
                            {
                              "border-primary": paymentMethod === option.value,
                              "border-muted": paymentMethod !== option.value,
                              "hover:bg-accent/50 hover:text-accent-foreground cursor-pointer": true,
                            }
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="sr-only"
                          />
                          <option.icon className="h-6 w-6" />
                          <span>{option.label}</span>
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button onClick={() => handleConfirmSale()} disabled={isSubmitting}>
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Retirada'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}
