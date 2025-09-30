"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { AddProductDialog } from "./add-product-dialog";
import type { ProductFormValues } from "./add-product-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";
import { ClonesImage } from "./clones-image";

type ProductListProps = {
  products: Product[];
  onAddProductToCart: (product: Product) => void;
  onAddProduct?: (values: Omit<ProductFormValues, 'type'>) => Promise<void>;
  isLoading: boolean;
  showAddProductButton?: boolean;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function ProductList({
  products,
  onAddProductToCart,
  onAddProduct,
  isLoading,
  showAddProductButton = true,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-headline font-semibold text-foreground">
          Itens de Estoque
        </h2>
        {showAddProductButton && onAddProduct && (
          <AddProductDialog onAddProduct={onAddProduct} />
        )}
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar item ou código..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ClonesImage />

      <div className="flex flex-col gap-3">
        {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex items-center p-3">
                 <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                 </div>
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                 </div>
              </Card>
            ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            return (
              <Card
                key={product.id}
                className={`flex items-center p-3 transition-shadow hover:shadow-md ${outOfStock ? 'opacity-50' : ''}`}
              >
                <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.description || 'Sem descrição'}</p>
                     <div className="flex gap-1 mt-1">
                      {outOfStock && (
                        <Badge variant="destructive">Esgotado</Badge>
                      )}
                      <Badge variant="secondary">{product.stock} em estoque</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-lg w-24 text-right">
                    {formatCurrency(product.price)}
                  </p>
                  <Button
                    size="icon"
                    aria-label={`Adicionar ${product.name} à lista`}
                    onClick={() => onAddProductToCart(product)}
                    disabled={outOfStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
