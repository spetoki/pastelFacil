"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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
import Image from "next/image";
import { AddProductDialog } from "./add-product-dialog";
import type { ProductFormValues } from "./add-product-form";

type ProductListProps = {
  products: Product[];
  onAddProductToCart: (product: Product) => void;
  onAddProduct: (values: ProductFormValues) => Promise<void>;
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
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  const imageMap = new Map(PlaceHolderImages.map((p) => [p.id, p]));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-headline font-semibold text-foreground">
          Produtos
        </h2>
        <AddProductDialog onAddProduct={onAddProduct} />
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto ou código..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const placeholder = imageMap.get(product.imageId);
          return (
            <Card
              key={product.id}
              className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardHeader className="p-0">
                {placeholder && (
                  <div className="aspect-[4/3] relative w-full">
                    <Image
                      src={placeholder.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      data-ai-hint={placeholder.imageHint}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <CardTitle className="text-lg font-headline">
                  {product.name}
                </CardTitle>
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
                  aria-label={`Adicionar ${product.name} ao carrinho`}
                  onClick={() => onAddProductToCart(product)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}
