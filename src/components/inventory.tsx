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

type InventoryProps = {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (values: ProductFormValues) => Promise<void>;
};

export function Inventory({
  products,
  onUpdateStock,
  onAddProduct,
}: InventoryProps) {
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleStockChange = (productId: string, value: string) => {
    const newStock = parseInt(value, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      setStockUpdates((prev) => ({ ...prev, [productId]: newStock }));
    }
  };

  const handleSaveStock = (productId: string) => {
    if (stockUpdates[productId] !== undefined) {
      onUpdateStock(productId, stockUpdates[productId]);
      const { [productId]: _, ...rest } = stockUpdates;
      setStockUpdates(rest);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
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
          {filteredProducts.map((product) => (
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
                    value={stockUpdates[product.id] ?? product.stock}
                    onChange={(e) =>
                      handleStockChange(product.id, e.target.value)
                    }
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveStock(product.id)}
                    disabled={stockUpdates[product.id] === undefined}
                  >
                    Salvar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}
