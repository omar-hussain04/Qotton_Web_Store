"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/products";
import type { Product } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Product, "id">) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text mb-2">إضافة منتج جديد</h1>
        <p className="text-muted">قم بإدخال تفاصيل المنتج لإضافته إلى المتجر.</p>
      </div>
      
      <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
