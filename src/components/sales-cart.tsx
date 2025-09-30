"use client";

import type { CartItem, Client, PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Barcode, Minus, Plus, ShoppingCart, Trash2, CreditCard, Landmark, CircleDollarSign, User, FileSignature } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SalesCartProps = {
  items: CartItem[];
  clients: Client[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onFinalizeSale: (
    paymentMethod: PaymentMethod,
    clientId?: string,
    overrideTotal?: number,
    andThen?: 'navigateToContracts'
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
  clients,
  onUpdateQuantity,
  onRemoveItem,
  onFinalizeSale,
  onAddByBarcode,
}: SalesCartProps) {
  const [barcode, setBarcode] = useState("");
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Dinheiro");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
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
      setSelectedClientId(undefined);
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

  const handleConfirmSale = async (andThen?: 'navigateToContracts') => {
     if (paymentMethod === "Fiado" && !selectedClientId) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente para vendas em fiado.",
      });
      return;
    }

    setIsSubmitting(true);
    await onFinalizeSale(paymentMethod, selectedClientId, total, andThen);
    setIsSubmitting(false);
    setIsFinalizeDialogOpen(false);
    setManualTotal(undefined);
  }

  const paymentOptions: { value: PaymentMethod; label: string, icon: React.FC<any> }[] = [
    { value: "Dinheiro", label: "Dinheiro", icon: CircleDollarSign },
    { value: "Pix", label: "Pix", icon: Landmark },
    { value: "Cartão", label: "Cartão", icon: CreditCard },
    { value: "Fiado", label: "Fiado", icon: User },
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
                    className="grid grid-cols-2 gap-4"
                  >
                    {paymentOptions.map((option) => {
                      const isFiado = option.value === "Fiado";
                      const noClients = clients.length === 0;
                      const isDisabled = isFiado && noClients;

                      return (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4",
                            {
                              "border-primary": paymentMethod === option.value,
                              "border-muted": paymentMethod !== option.value,
                              "hover:bg-accent/50 hover:text-accent-foreground cursor-pointer":
                                !isDisabled,
                              "opacity-50 cursor-not-allowed": isDisabled,
                            }
                          )}
                          title={isDisabled ? "Cadastre um cliente para usar esta opção" : ""}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="sr-only"
                            disabled={isDisabled}
                          />
                          <option.icon className="h-6 w-6" />
                          <span>{option.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>

                  {paymentMethod === "Fiado" && (
                    <div className="space-y-2">
                      <Label htmlFor="client-select">Selecionar Cliente</Label>
                      <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                          <SelectTrigger id="client-select">
                            <SelectValue placeholder="Escolha um cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.length > 0 ? (
                              clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Nenhum cliente cadastrado.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                    </div>
                  )}
                </div>
                <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <DialogClose asChild className="sm:col-span-1">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button onClick={() => handleConfirmSale()} disabled={isSubmitting} className="sm:col-span-1">
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Retirada'}
                  </Button>
                  <Button onClick={() => handleConfirmSale('navigateToContracts')} disabled={isSubmitting} variant="secondary" className="sm:col-span-1">
                    <FileSignature className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Confirmando...' : 'Confirmar e Criar Contrato'}
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
