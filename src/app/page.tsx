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
  where,
  Timestamp,
  onSnapshot,
  deleteDoc,
  getDoc,
  setDoc,
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
  DailyClosure,
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
import { DailyClosuresHistory } from "@/components/daily-closures-history";
import { CashClosing } from "@/components/cash-closing";
import {
  DollarSign,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  FileText,
  Settings,
} from "lucide-react";
import { isAuthenticated, clearAuthentication } from "@/lib/auth";
import { ClientList } from "@/components/client-list";
import type { ClientFormValues } from "@/components/add-client-form";
import { Settings as SettingsComponent } from "@/components/settings";
import { ReportPinDialog } from "@/components/report-pin-dialog";

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const STATUS_DOC_ID = "main";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [fiadoSales, setFiadoSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<CashTransaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashTransaction[]>([]);
  const [debtPayments, setDebtPayments] = useState<CashTransaction[]>([]);
  const [dailyClosures, setDailyClosures] = useState<DailyClosure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [shiftStart, setShiftStart] = useState<Date | null>(null);
  const [isReportsUnlocked, setIsReportsUnlocked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setIsClient(true);
  }, [router]);


  useEffect(() => {
    if (!isClient) return;

    setIsLoading(true);
    
    // Fetch and listen to shift start time from Firestore
    const statusRef = doc(db, "appStatus", STATUS_DOC_ID);
    const unsubscribeStatus = onSnapshot(statusRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setShiftStart((data.currentShiftStart as Timestamp).toDate());
        } else {
            // Document doesn't exist, create it with the start of today
            const startOfShift = getStartOfToday();
            await setDoc(statusRef, { currentShiftStart: Timestamp.fromDate(startOfShift) });
            setShiftStart(startOfShift);
        }
    }, (error) => {
        console.error("Error fetching app status: ", error);
        toast({ variant: "destructive", title: "Erro ao sincronizar turno" });
    });

    return () => {
        unsubscribeStatus();
    }
  }, [isClient, toast]);


  useEffect(() => {
    if (!isClient || !shiftStart) return;

    setIsLoading(true);

    const startOfTodayTimestamp = Timestamp.fromDate(getStartOfToday());
    const shiftStartTimestamp = Timestamp.fromDate(shiftStart);

    const productsQuery = query(collection(db, 'products'), ("name"));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsList.sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar produtos" });
      setIsLoading(false);
    });

    const clientsQuery = query(collection(db, 'clients'), ("name"));
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsList.sort((a,b) => a.name.localeCompare(b.name)));
    }, (error) => {
      console.error("Error fetching clients: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar clientes" });
    });
    
    // Query for sales of the current shift (Dinheiro, Pix, Cartão)
    const shiftSalesQuery = query(
      collection(db, "sales"), 
      where("date", ">=", shiftStartTimestamp), 
    );
    const unsubscribeSales = onSnapshot(shiftSalesQuery, (snapshot) => {
      const salesList: Sale[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Separate fiado sales to be handled by their own query
        if (data.paymentMethod !== 'Fiado') {
            salesList.push({
              id: doc.id,
              ...data,
              date: (data.date as Timestamp).toDate(),
            } as Sale);
        }
      });
      setSalesHistory(salesList.sort((a,b) => b.date.getTime() - a.date.getTime()));
    }, (error) => {
      console.error("Error fetching shift sales: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar vendas do turno" });
    });
    
    // Query for all fiado sales of the entire day
    const fiadoSalesQuery = query(
        collection(db, "sales"),
        where("date", ">=", startOfTodayTimestamp)
    );
    const unsubscribeFiadoSales = onSnapshot(fiadoSalesQuery, (snapshot) => {
        const fiadoList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            } as Sale;
        }).filter(sale => sale.paymentMethod === 'Fiado');
        setFiadoSales(fiadoList.sort((a,b) => b.date.getTime() - a.date.getTime()));
    }, (error) => {
        console.error("Error fetching fiado sales: ", error);
        toast({ variant: "destructive", title: "Erro ao buscar vendas fiado" });
    });


    // Query shift-specific transactions (expenses, cash entries)
    const shiftTransactionsQuery = query(collection(db, "transactions"), where("date", ">=", shiftStartTimestamp));
    const unsubscribeShiftTransactions = onSnapshot(shiftTransactionsQuery, (snapshot) => {
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
      setExpenses(expensesList.sort((a,b) => b.date.getTime() - a.date.getTime()));
      setCashEntries(cashEntriesList.sort((a,b) => b.date.getTime() - a.date.getTime()));
    }, (error) => {
      console.error("Error fetching shift transactions: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar transações do turno" });
    });

    // Query day-specific debt payments
    const debtPaymentsQuery = query(collection(db, "transactions"), where("date", ">=", startOfTodayTimestamp), where("type", "==", "debtPayment"));
    const unsubscribeDebtPayments = onSnapshot(debtPaymentsQuery, (snapshot) => {
        const paymentsList: CashTransaction[] = [];
         snapshot.forEach(doc => {
            const data = doc.data();
            paymentsList.push({
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            } as CashTransaction);
        });
        // Sort in client-side
        setDebtPayments(paymentsList.sort((a,b) => b.date.getTime() - a.date.getTime()));
    }, (error) => {
       console.error("Error fetching debt payments: ", error);
       toast({ variant: "destructive", title: "Erro ao buscar pagamentos de dívidas" });
    });

    const dailyClosuresQuery = query(collection(db, "dailySummaries"));
    const unsubscribeDailyClosures = onSnapshot(dailyClosuresQuery, (snapshot) => {
      const closuresList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
        } as DailyClosure;
      });
      setDailyClosures(closuresList.sort((a,b) => b.date.getTime() - a.date.getTime()));
    }, (error) => {
      console.error("Error fetching daily closures: ", error);
      toast({ variant: "destructive", title: "Erro ao buscar relatórios" });
    });

    return () => {
      unsubscribeProducts();
      unsubscribeClients();
      unsubscribeSales();
      unsubscribeFiadoSales();
      unsubscribeShiftTransactions();
      unsubscribeDebtPayments();
      unsubscribeDailyClosures();
    };
  }, [isClient, toast, shiftStart]);

  const allSalesForHistory = useMemo(() => [...salesHistory, ...fiadoSales].sort((a,b) => b.date.getTime() - a.date.getTime()), [salesHistory, fiadoSales]);

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

    const batch = writeBatch(db);

    if (paymentMethod === "Fiado" && clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        newSale.clientId = clientId;
        newSale.clientName = client.name;
        
        const clientRef = doc(db, "clients", clientId);
        const newDebt = (client.debt || 0) + total;
        batch.update(clientRef, { debt: newDebt });
      }
    }
  
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
      } catch (error) {
        console.error("Error adding product: ", error);
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

  const handleDeleteProduct = useCallback(
    async (productId: string): Promise<void> => {
      try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        toast({
          title: "Produto Excluído!",
          description: "O produto foi removido permanentemente do sistema.",
        });
      } catch (error) {
        console.error("Error deleting product: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir produto",
          description: "Não foi possível remover o produto.",
        });
        throw error;
      }
    },
    [toast]
  );

  const handleAddClient = useCallback(
    async (values: ClientFormValues): Promise<void> => {
      try {
        await addDoc(collection(db, "clients"), {...values, debt: 0});
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

  const handlePayDebt = useCallback(
    async (
      clientId: string,
      amount: number,
      paymentMethod: PaymentMethod
    ): Promise<void> => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) {
        toast({ variant: "destructive", title: "Cliente não encontrado." });
        throw new Error("Client not found");
      }

      if (amount <= 0) {
        toast({ variant: "destructive", title: "Valor inválido." });
        throw new Error("Invalid amount");
      }

      const newDebt = client.debt - amount;
      if (newDebt < 0) {
         toast({ variant: "destructive", title: "Valor excede a dívida.", description: `O cliente deve apenas ${client.debt}` });
         throw new Error("Amount exceeds debt");
      }

      const batch = writeBatch(db);

      // 1. Update client's debt
      const clientRef = doc(db, "clients", clientId);
      batch.update(clientRef, { debt: newDebt });

      // 2. Add transaction for the cash entry
      const transaction: Omit<CashTransaction, "id"> = {
        date: new Date(),
        type: "debtPayment",
        description: `Pagamento de dívida - ${client.name}`,
        amount: amount,
        paymentMethod: paymentMethod,
      };
      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, transaction);
      
      try {
        await batch.commit();
        toast({
          title: "Pagamento recebido!",
          description: `${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)} recebido de ${client.name}.`
        });
      } catch (error) {
        console.error("Error processing debt payment: ", error);
        toast({ variant: "destructive", title: "Erro ao processar pagamento" });
        throw error;
      }
    },
    [toast, clients]
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

  const handleCloseDay = useCallback(async (closureData: Omit<DailyClosure, 'id' | 'date'>) => {
    const newClosure = {
      date: new Date(),
      ...closureData,
    }

    try {
      // 1. Save the daily summary report
      await addDoc(collection(db, 'dailySummaries'), newClosure);
      
      // 2. Start a new shift by updating the global shift start time
      const statusRef = doc(db, "appStatus", STATUS_DOC_ID);
      await updateDoc(statusRef, {
          currentShiftStart: Timestamp.fromDate(new Date())
      });
      
      // 3. Reset local state
      setCartItems([]);
      
      toast({
        title: "Dia Fechado com Sucesso!",
        description: "Um novo turno de vendas foi iniciado em todos os dispositivos."
      });

    } catch(error) {
       console.error("Error closing day: ", error);
       toast({
         variant: "destructive",
         title: "Erro ao fechar o dia",
         description: "Não foi possível salvar o resumo diário e iniciar um novo turno."
       });
       throw error;
    }
  }, [toast]);
  
  if (!isClient || !shiftStart) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Placeholder for loading state or spinner */}
      </div>
    );
  }
  const handleUnlockReports = () => {
    setIsReportsUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLogout={handleLogout} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="caixa">
          <TabsList className="grid w-full grid-cols-7 mb-6">
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
             <TabsTrigger value="relatorios">
              <FileText className="mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="mr-2" />
              Configurações
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
              onDeleteProduct={handleDeleteProduct}
              isLoading={isLoading}
            />
          </TabsContent>
           <TabsContent value="clientes">
            <ClientList
              clients={clients}
              onAddClient={handleAddClient}
              onPayDebt={handlePayDebt}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="vendas">
            <SalesHistoryComponent sales={allSalesForHistory} />
          </TabsContent>
          <TabsContent value="fechamento">
            <CashClosing
              sales={salesHistory}
              fiadoSales={fiadoSales}
              expenses={expenses}
              cashEntries={cashEntries}
              debtPayments={debtPayments}
              clients={clients}
              onAddTransaction={handleAddTransaction}
              onCloseDay={handleCloseDay}
              onPayDebt={handlePayDebt}
            />
          </TabsContent>
          <TabsContent value="relatorios">
            {isReportsUnlocked ? (
                <DailyClosuresHistory closures={dailyClosures} />
            ) : (
                <ReportPinDialog onUnlock={handleUnlockReports} />
            )}
            </TabsContent>
          <TabsContent value="configuracoes">
            <SettingsComponent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    