export interface ColorOption {
  name: string;
  hex: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  costPrice?: number; // Added for profit tracking
  originalPrice?: number;
  discount?: number;
  images: string[];
  colors: ColorOption[];
  sizes: string[];
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  isNew: boolean;
  inStock: boolean;
}
