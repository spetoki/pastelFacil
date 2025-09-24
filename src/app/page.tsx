"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  Product,
  CartItem,
  Sale,
  DailySummaryData,
  CashTransaction,
} from "@/lib/types";
import { initialProducts } from "@/lib/data";
import { Header } from "@/components/header";
import { DailySummary } from "@/components/daily-summary";
import { ProductList } from "@/components/product-list";
import { SalesCart } from "@/components/sales-cart";
import { AiSuggestions } from "@/components/ai-suggestions";
import { useToast } from "@/hooks/use-toast";
import type { ProductFormValues } from "@/components/add-product-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inventory } from "@/components/inventory";
import { SalesHistory as SalesHistoryComponent } from "@/components/sales-history";
import { CashClosing } from "@/components/cash-closing";
import {
  DollarSign,
  Package,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<CashTransaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashTransaction[]>([]);
  const { toast } = useToast();

  const handleAddProductToCart = useCallback(
    (product: Product) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.product.id === product.id
        );
        if (existingItem) {
          if (existingItem.quantity >= product.stock) {
            toast({
              variant: "destructive",
              title: "Estoque insuficiente",
              description: `Não há mais ${product.name} em estoque.`,
            });
            return prevItems;
          }
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        if (product.stock < 1) {
          toast({
            variant: "destructive",
            title: "Estoque insuficiente",
            description: `Não há mais ${product.name} em estoque.`,
          });
          return prevItems;
        }
        return [...prevItems, { product, quantity: 1 }];
      });
      const existingItem = cartItems.find(
        (item) => item.product.id === product.id
      );
      if (!existingItem || existingItem.quantity < product.stock) {
        toast({
          title: `${product.name} adicionado!`,
          description: "O item foi adicionado ao carrinho.",
        });
      }
    },
    [toast, cartItems]
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
      const product = products.find((p) => p.id === productId);
      if (product && newQuantity > product.stock) {
        toast({
          variant: "destructive",
          title: "Estoque insuficiente",
          description: `Apenas ${product.stock} unidades de ${product.name} disponíveis.`,
        });
        return;
      }

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
    [products, toast]
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

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cartItems.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      })
    );

    setSalesHistory((prev) => [newSale, ...prev]);
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
          const newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: values.name,
            description: values.description || "",
            price: values.price,
            barcode: values.barcode,
            stock: values.stock,
            imageId: "pao_de_queijo",
          };
          setProducts((prev) => [newProduct, ...prev]);
          resolve();
        }, 500);
      });
    },
    []
  );

  const handleUpdateStock = useCallback(
    (productId: string, newStock: number) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    },
    []
  );

  const handleAddTransaction = useCallback(
    (
      type: "expense" | "cashEntry",
      values: { description: string; amount: number }
    ) => {
      const newTransaction: CashTransaction = {
        id: `${type}_${Date.now()}`,
        date: new Date(),
        ...values,
      };
      if (type === "expense") {
        setExpenses((prev) => [newTransaction, ...prev]);
        toast({ title: "Despesa registrada com sucesso!" });
      } else {
        setCashEntries((prev) => [newTransaction, ...prev]);
        toast({ title: "Entrada de caixa registrada com sucesso!" });
      }
    },
    [toast]
  );

  const dailySummary: DailySummaryData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSales = salesHistory.filter(
      (sale) => sale.date.getTime() >= today.getTime()
    );

    const totalRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const numberOfSales = todaysSales.length;
    const averageSaleValue =
      numberOfSales > 0 ? totalRevenue / numberOfSales : 0;

    return { totalRevenue, numberOfSales, averageSaleValue };
  }, [salesHistory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="caixa">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="caixa">
              <ShoppingCart className="mr-2" />
              Caixa
            </TabsTrigger>
            <TabsTrigger value="estoque">
              <Package className="mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="vendas">
              <DollarSign className="mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="fechamento">
              <ClipboardList className="mr-2" />
              Fechamento
            </TabsTrigger>
          </TabsList>
          <TabsContent value="caixa">
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
          </TabsContent>
          <TabsContent value="estoque">
            <Inventory products={products} onUpdateStock={handleUpdateStock} />
          </TabsContent>
          <TabsContent value="vendas">
            <SalesHistoryComponent sales={salesHistory} />
          </TabsContent>
          <TabsContent value="fechamento">
            <CashClosing
              sales={salesHistory}
              expenses={expenses}
              cashEntries={cashEntries}
              onAddTransaction={handleAddTransaction}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
