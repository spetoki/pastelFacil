export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  barcode: string;
  imageId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Sale = {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
};

export type DailySummaryData = {
  totalRevenue: number;
  numberOfSales: number;
  averageSaleValue: number;
};
