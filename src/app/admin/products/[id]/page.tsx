"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById, updateProduct } from "@/lib/products";
import type { Product } from "@/types";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (typeof id === "string") {
        const prod = await getProductById(id);
        setProduct(prod);
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleSubmit = async (data: Omit<Product, "id">) => {
    if (typeof id !== "string") return;
    setIsSubmitting(true);
    try {
      await updateProduct(id, data);
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تحديث المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-muted font-bold text-xl">المنتج غير موجود</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text mb-2">تعديل المنتج</h1>
        <p className="text-muted">تحديث تفاصيل منتج "{product.name}"</p>
      </div>
      
      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
