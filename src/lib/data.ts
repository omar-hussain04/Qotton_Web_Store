import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "هودي الليالي الدافئة",
    slug: "warm-nights-hoodie",
    price: 15,
    originalPrice: 20,
    discount: 25,
    images: ["/product/1.png", "/product/2.png"],
    colors: [
      { name: "أسود", hex: "#111111", stock: 15 },
      { name: "كحلي", hex: "#2a323d", stock: 15 },
      { name: "بيج", hex: "#c9a98e", stock: 15 },
      { name: "أبيض", hex: "#ffffff", stock: 15 }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    description: "هودي فاخر مصنوع من أجود أنواع القطن، يوفر لك الدفء والراحة مع طابع عربي أصيل. مثالي للأمسيات الباردة.",
    category: "hoodie",
    tags: ["جديد", "bestseller"],
    rating: 4.8,
    reviewsCount: 124,
    isNew: true,
    inStock: true
  },
  {
    id: "p2",
    name: "هودي الأصالة",
    slug: "heritage-hoodie",
    price: 15,
    images: ["/product/3.png", "/product/4.png", "/product/5.png"],
    colors: [
      { name: "أسود", hex: "#111111", stock: 15 },
      { name: "كحلي", hex: "#2a323d", stock: 15 },
      { name: "بيج", hex: "#c9a98e", stock: 15 },
      { name: "أبيض", hex: "#ffffff", stock: 15 }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    description: "تصميم كلاسيكي يجمع بين الفخامة والبساطة.",
    category: "hoodie",
    tags: ["bestseller"],
    rating: 4.5,
    reviewsCount: 89,
    isNew: false,
    inStock: true
  },
  {
    id: "p3",
    name: "هودي الصحراء الذهبية",
    slug: "golden-desert-hoodie",
    price: 15,
    originalPrice: 18,
    discount: 15,
    images: ["/product/7.png", "/product/8.png", "/product/9.png"],
    colors: [
      { name: "أسود", hex: "#111111", stock: 15 },
      { name: "كحلي", hex: "#2a323d", stock: 15 },
      { name: "بيج", hex: "#c9a98e", stock: 15 },
      { name: "أبيض", hex: "#ffffff", stock: 15 }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    description: "مستوحى من ألوان الصحراء الدافئة. مريح وأنيق لجميع الأوقات.",
    category: "hoodie",
    tags: ["جديد"],
    rating: 4.9,
    reviewsCount: 45,
    isNew: true,
    inStock: true
  }
];
