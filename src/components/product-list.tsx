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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
               <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-20" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            return (
              <Card
                key={product.id}
                className={`flex flex-col ${outOfStock ? 'opacity-50' : ''}`}
              >
                <CardHeader className="flex-1">
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    {product.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {outOfStock && (
                      <Badge variant="destructive">Esgotado</Badge>
                    )}
                     <Badge variant="secondary">{product.stock} em estoque</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    aria-label={`Adicionar ${product.name} à lista`}
                    onClick={() => onAddProductToCart(product)}
                    disabled={outOfStock}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </CardFooter>
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
