export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  barcode: string;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

// Um tipo simplificado para o item do carrinho dentro de uma Venda
// para evitar problemas de serialização com o Firestore.
export type SaleItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type PaymentMethod = "Dinheiro" | "Pix" | "Cartão" | "Fiado";

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  date: Date;
  paymentMethod: PaymentMethod;
  clientId?: string;
  clientName?: string;
};

export type DailySummaryData = {
  totalRevenue: number;
  numberOfSales: number;
  averageSaleValue: number;
};

export type CashTransaction = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type?: "expense" | "cashEntry" | "debtPayment";
  paymentMethod?: PaymentMethod;
};

export type Client = {
  id: string;
  name: string;
  address: string;
  cpf: string;
  phone: string;
  debt: number;
};

export type DailyClosure = {
  id: string;
  date: Date;
  totalRevenue: number;
  totalByPaymentMethod: Record<string, number>;
  totalExpenses: number;
  totalCashEntries: number;
  expectedInCash: number;
  countedAmount: number;
  difference: number;
};
