"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Product,
  CartItem,
  Sale,
  DailySummaryData,
  CashTransaction,
  SaleItem,
  Client,
  PaymentMethod,
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
  Users,
} from "lucide-react";
import { isAuthenticated, clearAuthentication } from "@/lib/auth";
import { ClientList } from "@/components/client-list";
import type { ClientFormValues } from "@/components/add-client-form";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<CashTransaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return; // Stop execution if not authenticated
    }
  
    setIsClient(true);
    setIsLoading(true);

    const productsQuery = query(collection(db, 'products'), orderBy("name"));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar produtos" });
      setIsLoading(false);
    });

    const clientsQuery = query(collection(db, 'clients'), orderBy("name"));
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsList);
    }, (error) => {
      console.error("Error fetching clients: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar clientes" });
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = Timestamp.fromDate(today);

    const salesQuery = query(collection(db, "sales"), where("date", ">=", startOfToday), orderBy("date", "desc"));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
        } as Sale;
      });
      setSalesHistory(salesList);
    }, (error) => {
      console.error("Error fetching sales: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar vendas" });
    });

    const transactionsQuery = query(collection(db, "transactions"), where("date", ">=", startOfToday), orderBy("date", "desc"));
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const expensesList: CashTransaction[] = [];
      const cashEntriesList: CashTransaction[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const transaction = {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
        } as CashTransaction;
        if (data.type === 'expense') {
          expensesList.push(transaction);
        } else if (data.type === 'cashEntry') {
          cashEntriesList.push(transaction);
        }
      });
      setExpenses(expensesList);
      setCashEntries(cashEntriesList);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar transações" });
    });

    // Cleanup function
    return () => {
      unsubscribeProducts();
      unsubscribeClients();
      unsubscribeSales();
      unsubscribeTransactions();
    };
  }, [router, toast]);


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

  const handleFinalizeSale = useCallback(async (
    paymentMethod: PaymentMethod,
    clientId?: string
  ) => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  
    const saleItems: SaleItem[] = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    
    const newSale: Omit<Sale, 'id'> = {
      items: saleItems,
      total,
      date: new Date(),
      paymentMethod,
    };

    if (paymentMethod === "Fiado" && clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        newSale.clientId = clientId;
        newSale.clientName = client.name;
      }
    }

    const batch = writeBatch(db);
  
    for (const item of cartItems) {
      if (!item.product.id) {
        console.error("Error: Product in cart is missing an ID.", item.product);
        toast({
          variant: "destructive",
          title: "Erro no Carrinho",
          description: `O produto ${item.product.name} está com um problema. Remova-o e adicione novamente.`,
        });
        return;
      }
      const productRef = doc(db, "products", item.product.id);
      const newStock = item.product.stock - item.quantity;
      batch.update(productRef, { stock: newStock });
    }
  
    try {
      const salesCollection = collection(db, "sales");
      const saleDocRef = doc(salesCollection);
      batch.set(saleDocRef, newSale);
      
      await batch.commit();
  
      setCartItems([]);
  
      toast({
        title: "Venda Finalizada!",
        description: `Total de ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(total)} em ${paymentMethod}.`,
      });
    } catch (error) {
      console.error("Error finalizing sale: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar venda",
        description: "Não foi possível salvar a venda ou atualizar o estoque.",
      });
    }
  }, [cartItems, toast, clients]);

  const handleAddProduct = useCallback(
    async (values: ProductFormValues): Promise<void> => {
      try {
        await addDoc(collection(db, "products"), values);
        // O estado será atualizado via onSnapshot
      } catch (error) {
        console.error("Error adding product: ", error);
        // O erro é relançado para ser tratado no componente do formulário.
        throw error;
      }
    },
    []
  );
  
  const handleUpdateProduct = useCallback(
    async (productId: string, values: ProductFormValues): Promise<void> => {
      try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, values);
        // O estado será atualizado via onSnapshot
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
        // O estado será atualizado via onSnapshot
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

  const handleAddClient = useCallback(
    async (values: ClientFormValues): Promise<void> => {
      try {
        await addDoc(collection(db, "clients"), values);
        // O estado será atualizado via onSnapshot
      } catch (error) {
        console.error("Error adding client: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar cliente",
          description: "Não foi possível salvar o novo cliente.",
        });
        throw error;
      }
    },
    [toast]
  );

  const handleAddTransaction = useCallback(
    async (
      type: "expense" | "cashEntry",
      values: { description: string; amount: number }
    ) => {
      const newTransaction = {
        date: new Date(),
        type: type,
        ...values,
      };

      try {
        await addDoc(collection(db, 'transactions'), newTransaction);
        // O estado será atualizado via onSnapshot
        if (type === "expense") {
          toast({ title: "Despesa registrada com sucesso!" });
        } else {
          toast({ title: "Entrada de caixa registrada com sucesso!" });
        }
      } catch(error) {
          console.error("Error adding transaction: ", error);
          toast({
            variant: "destructive",
            title: "Erro ao registrar transação",
          });
      }
    },
    [toast]
  );

  const dailySummary: DailySummaryData = useMemo(() => {
    const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const numberOfSales = salesHistory.length;
    const averageSaleValue =
      numberOfSales > 0 ? totalRevenue / numberOfSales : 0;

    return { totalRevenue, numberOfSales, averageSaleValue };
  }, [salesHistory]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Renderiza um spinner ou uma página em branco durante o redirecionamento */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLogout={handleLogout} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="caixa">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="caixa">
              <ShoppingCart className="mr-2" />
              Caixa
            </TabsTrigger>
            <TabsTrigger value="estoque">
              <Package className="mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <Users className="mr-2" />
              Clientes
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
                  isLoading={isLoading}
                  showAddProductButton={false}
                />
              </div>
              <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                <SalesCart
                  items={cartItems}
                  clients={clients}
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
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onUpdateStock={handleUpdateStock}
              isLoading={isLoading}
            />
          </TabsContent>
           <TabsContent value="clientes">
            <ClientList
              clients={clients}
              onAddClient={handleAddClient}
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
