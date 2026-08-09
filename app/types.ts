export type Role = "guest" | "consumer" | "admin";

export type Screen =
  | "welcome"
  | "login"
  | "guide"
  | "profileSetup"
  | "home"
  | "search"
  | "product"
  | "cart"
  | "orders"
  | "wishlist"
  | "profile"
  | "admin";

export type Product = {
  id: string;
  title: string;
  note: string;
  price: number;
  fee: number;
  images: string[];
  visual: string;
  category: string;
  stock: number;
  sold: number;
  createdAt: number;
  pinned: boolean;
  soldOut: boolean;
  availability?: ProductAvailability;
  order: number;
  shippingOverride?: number;
};

export type ProductAvailability =
  | "ready"
  | "preorder"
  | "po_open"
  | "po_closed"
  | "sold_out";

export type CartLine = { productId: string; qty: number };

export type OrderStatus =
  | "payment"
  | "accepted"
  | "process"
  | "shipping"
  | "received"
  | "canceled";

export type Review = { note: string; photo?: string; createdAt: number };

export type Order = {
  id: string;
  createdAt: number;
  customerName: string;
  customerPhone?: string;
  address: string;
  region: string;
  lines: Array<{
    productId: string;
    title: string;
    qty: number;
    price: number;
    fee: number;
  }>;
  itemTotal: number;
  feeTotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  handledBy?: AdminAccount;
  review?: Review;
};

export type Profile = {
  nickname: string;
  phone: string;
  avatarIndex: number;
  avatarUpload?: string;
  address: string;
  region: string;
};

export type AdminAccount = {
  id: string;
  name: string;
  avatarIndex: number;
};

export type ShippingRates = Record<string, number>;
