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

export type PaymentMethod = "Dinheiro" | "Pix" | "Cartão";

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
  totalItemsSold: number;
};

export type CashTransaction = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type?: "expense" | "cashEntry";
  paymentMethod?: PaymentMethod;
};

export type Client = {
  id: string;
  name: string;
  debt: number;

  // PF fields
  cpf?: string;
  address?: string;
  phone?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
  rg?: string;
  email?: string;

  // PJ fields
  isPJ?: boolean;
  razaoSocial?: string;
  cnpj?: string;
  ie?: string; // Inscrição Estadual/Municipal
  sedeAddress?: string;
  repLegalNome?: string;
  repLegalDados?: string;
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

export type AppBanner = {
    base64: string;
    updatedAt: Date;
}

export type GroupedProducts = {
  [key: string]: Product[];
};
