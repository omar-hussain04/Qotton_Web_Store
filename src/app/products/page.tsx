"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (activeFilter === "all") return true;
    return product.category === activeFilter;
  });

  return (
    <Container className="py-12 min-h-[70vh]">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-accent mb-2">تسوق منتجاتنا</h1>
        <p className="text-muted text-lg">اكتشف منتجات صُممت بعناية لتُعانق ذوقك الرفيع.</p>
      </div>

      {/* Simple Filters UI */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-border overflow-x-auto">
        <button 
          onClick={() => setActiveFilter("all")}
          className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "all" ? "border-accent bg-accent text-primary" : "border-border text-muted hover:text-text hover:border-accent/50"}`}
        >الكل</button>
        <button 
          onClick={() => setActiveFilter("men")}
          className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "men" ? "border-accent bg-accent text-primary" : "border-border text-muted hover:text-text hover:border-accent/50"}`}
        >رجالي</button>
        <button 
          onClick={() => setActiveFilter("women")}
          className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "women" ? "border-accent bg-accent text-primary" : "border-border text-muted hover:text-text hover:border-accent/50"}`}
        >نسائي</button>
        <button 
          onClick={() => setActiveFilter("kids")}
          className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "kids" ? "border-accent bg-accent text-primary" : "border-border text-muted hover:text-text hover:border-accent/50"}`}
        >أطفال</button>
        <button 
          onClick={() => setActiveFilter("unisex")}
          className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "unisex" ? "border-accent bg-accent text-primary" : "border-border text-muted hover:text-text hover:border-accent/50"}`}
        >للجنسين</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center p-20 text-muted">
              <h3 className="text-xl font-medium mb-2">لا يوجد منتجات متاحة</h3>
              <p>عذراً، لم يتم العثور على أي منتجات في هذا التصنيف حالياً.</p>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
