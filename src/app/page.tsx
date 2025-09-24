"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
  query
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Product,
  CartItem,
  Sale,
  DailySummaryData,
  CashTransaction,
} from "@/lib/types";
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
import { isAuthenticated, clearAuthentication } from "@/lib/auth";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<CashTransaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashTransaction[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productsList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar produtos",
        description: "Não foi possível carregar os produtos do banco de dados.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProducts();
    }
  }, [fetchProducts]);


  const handleLogout = () => {
    clearAuthentication();
    router.replace("/login");
  };

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

  const handleFinalizeSale = useCallback(async () => {
    if (cartItems.length === 0) return;
  
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const newSale: Omit<Sale, 'id'> = {
      items: cartItems.map(item => ({...item, product: { ...item.product, id: item.product.id || '' }})),
      total,
      date: new Date(),
    };
  
    const batch = writeBatch(db);
  
    cartItems.forEach(item => {
      if(item.product.id) {
        const productRef = doc(db, "products", item.product.id);
        const newStock = item.product.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
      }
    });
  
    try {
      // await addDoc(collection(db, "sales"), newSale); // We will integrate this later
      await batch.commit();
  
      setSalesHistory((prev) => [{...newSale, id: `sale_${Date.now()}`}, ...prev]);
      setCartItems([]);
      fetchProducts(); // Refresh products to show updated stock
  
      toast({
        title: "Venda Finalizada!",
        description: `Total de ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(total)}.`,
      });
    } catch (error) {
      console.error("Error finalizing sale: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar venda",
        description: "Não foi possível atualizar o estoque dos produtos.",
      });
    }
  }, [cartItems, toast, fetchProducts]);

  const handleAddProduct = useCallback(
    async (values: ProductFormValues): Promise<void> => {
      try {
        const docRef = await addDoc(collection(db, "products"), values);
        setProducts((prev) => [{ id: docRef.id, ...values }, ...prev]);
      } catch (error) {
        console.error("Error adding product: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar produto",
          description: "Não foi possível salvar o novo produto.",
        });
        throw error;
      }
    },
    [toast]
  );

  const handleUpdateProduct = useCallback(
    async (productId: string, values: ProductFormValues): Promise<void> => {
      try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, values);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  ...values,
                }
              : p
          )
        );
      } catch (error) {
        console.error("Error updating product: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar produto",
          description: "Não foi possível salvar as alterações.",
        });
        throw error;
      }
    },
    [toast]
  );

  const handleUpdateStock = useCallback(
    async (productId: string, newStock: number) => {
       try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, { stock: newStock });
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        toast({
          title: "Estoque atualizado!",
        });
      } catch (error) {
        console.error("Error updating stock: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar estoque",
        });
      }
    },
    [toast]
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

  if (!isClient || !isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Render a spinner or a blank page while redirecting */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLogout={handleLogout} />
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
                  isLoading={isLoading}
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
            <Inventory
              products={products}
              onUpdateStock={handleUpdateStock}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              isLoading={isLoading}
            />
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
