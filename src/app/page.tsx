"use client";

import { useState, useMemo, useCallback } from "react";
import type { Product, CartItem, Sale, DailySummaryData } from "@/lib/types";
import { initialProducts } from "@/lib/data";
import { Header } from "@/components/header";
import { DailySummary } from "@/components/daily-summary";
import { ProductList } from "@/components/product-list";
import { SalesCart } from "@/components/sales-cart";
import { AiSuggestions } from "@/components/ai-suggestions";
import { useToast } from "@/hooks/use-toast";
import type { ProductFormValues } from "@/components/add-product-form";

export default function Home() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const { toast } = useToast();

  const handleAddProductToCart = useCallback(
    (product: Product) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.product.id === product.id
        );
        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { product, quantity: 1 }];
      });
      toast({
        title: `${product.name} adicionado!`,
        description: "O item foi adicionado ao carrinho.",
      });
    },
    [toast]
  );

  const handleAddByBarcode = useCallback(
    (barcode: string): boolean => {
      const product = products.find((p) => p.barcode === barcode);
      if (product) {
        handleAddProductToCart(product);
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Produto não encontrado",
          description: `Nenhum produto com o código de barras "${barcode}".`,
        });
        return false;
      }
    },
    [products, handleAddProductToCart, toast]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      setCartItems(
        (prevItems) =>
          prevItems
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  const handleFinalizeSale = useCallback(() => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      items: cartItems,
      total,
      date: new Date(),
    };

    setSalesHistory((prev) => [...prev, newSale]);
    setCartItems([]);
    toast({
      title: "Venda Finalizada!",
      description: `Total de ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(total)}.`,
    });
  }, [cartItems, toast]);

  const handleAddProduct = useCallback(
    async (values: ProductFormValues): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate API call
          const newProduct: Product = {
            id: `prod_${Date.now()}`,
            ...values,
            imageId: "pao_de_queijo", // Using a default image for new products
          };
          setProducts((prev) => [newProduct, ...prev]);
          resolve();
        }, 500);
      });
    },
    []
  );

  const dailySummary: DailySummaryData = useMemo(() => {
    const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const numberOfSales = salesHistory.length;
    const averageSaleValue =
      numberOfSales > 0 ? totalRevenue / numberOfSales : 0;

    return { totalRevenue, numberOfSales, averageSaleValue };
  }, [salesHistory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <DailySummary summary={dailySummary} />
            <ProductList
              products={products}
              onAddProductToCart={handleAddProductToCart}
              onAddProduct={handleAddProduct}
            />
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <SalesCart
              items={cartItems}
              products={products}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onFinalizeSale={handleFinalizeSale}
              onAddByBarcode={handleAddByBarcode}
            />
            <AiSuggestions cartItems={cartItems} />
          </div>
        </div>
      </main>
    </div>
  );
}
