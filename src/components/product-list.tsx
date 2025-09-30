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
  onAddProduct?: (values: ProductFormValues) => Promise<void>;
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
              <Card key={i} className="flex flex-col overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardFooter>
              </Card>
            ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            return (
              <Card
                key={product.id}
                className={`flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${outOfStock ? 'opacity-50' : ''}`}
              >
                <CardHeader className="p-4 relative">
                  <CardTitle className="text-lg font-headline">
                    {product.name}
                  </CardTitle>
                  <div className="absolute top-2 right-2 flex gap-1">
                      {outOfStock && (
                        <Badge variant="destructive">Esgotado</Badge>
                      )}
                      <Badge variant="secondary">{product.stock} em estoque</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                  <CardDescription className="text-sm mt-1 h-10">
                    {product.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <p className="font-semibold text-lg">
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
