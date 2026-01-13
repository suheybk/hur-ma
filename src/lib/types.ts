export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  category: string;
  image: string | null;
  isActive: boolean;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SiteSettings {
  id: string;
  whatsapp: string;
  email: string | null;
  address: string | null;
  aboutText: string | null;
  heroTitle: string;
  heroSubtitle: string | null;
}
