"use client";

import type { CartItem, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Barcode, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type SalesCartProps = {
  items: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onFinalizeSale: () => void;
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

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      const success = onAddByBarcode(barcode.trim());
      if (success) {
        setBarcode("");
      }
    }
  };

  return (
    <div className="bg-card rounded-lg border h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Caixa / Venda Atual
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
            <p className="mt-2">O carrinho está vazio</p>
          </div>
        ) : (
          items.map(({ product, quantity }) => {
            return (
              <div key={product.id} className="flex items-center gap-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={64}
                    height={48}
                    className="rounded-md object-cover bg-muted"
                    unoptimized
                  />
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
                  <span className="w-6 text-center">{quantity}</span>
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
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            className="w-full h-12 text-base bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={onFinalizeSale}
          >
            Finalizar Venda
          </Button>
        </div>
      )}
    </div>
  );
}
