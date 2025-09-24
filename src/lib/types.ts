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

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  date: Date;
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
  type?: "expense" | "cashEntry";
};

export type Client = {
  id: string;
  name: string;
  address: string;
  cpf: string;
  phone: string;
};
