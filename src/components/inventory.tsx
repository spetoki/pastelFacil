"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductFormValues } from "./add-product-form";
import { AddProductDialog } from "./add-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { Pencil, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type InventoryProps = {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onAddProduct: (values: ProductFormValues) => Promise<void>;
  onUpdateProduct: (
    productId: string,
    values: ProductFormValues
  ) => Promise<void>;
  isLoading: boolean;
};

export function Inventory({
  products,
  onUpdateStock,
  onAddProduct,
  onUpdateProduct,
  isLoading,
}: InventoryProps) {
  const [stockUpdates, setStockUpdates] = useState<Record<string, { value: number; isSaving: boolean }>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleStockChange = (productId: string, value: string) => {
    const newStock = parseInt(value, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      setStockUpdates((prev) => ({ ...prev, [productId]: { value: newStock, isSaving: false } }));
    }
  };

  const handleSaveStock = async (productId: string) => {
    if (stockUpdates[productId] !== undefined) {
      setStockUpdates((prev) => ({ ...prev, [productId]: { ...prev[productId], isSaving: true } }));
      await onUpdateStock(productId, stockUpdates[productId].value);
      const { [productId]: _, ...rest } = stockUpdates;
      setStockUpdates(rest);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <AddProductDialog onAddProduct={onAddProduct} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Código de Barras</TableHead>
            <TableHead className="text-center">Estoque Atual</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-48 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={product.stock <= 10 ? "destructive" : "secondary"}
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={stockUpdates[product.id]?.value ?? ""}
                      placeholder={String(product.stock)}
                      onChange={(e) =>
                        handleStockChange(product.id, e.target.value)
                      }
                      className="w-24"
                      disabled={stockUpdates[product.id]?.isSaving}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveStock(product.id)}
                      disabled={stockUpdates[product.id] === undefined || stockUpdates[product.id]?.isSaving}
                    >
                      {stockUpdates[product.id]?.isSaving && <Loader2 className="mr-2 animate-spin" />}
                      Salvar
                    </Button>
                    <EditProductDialog
                      product={product}
                      onUpdateProduct={onUpdateProduct}
                    >
                      <Button size="icon" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditProductDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
