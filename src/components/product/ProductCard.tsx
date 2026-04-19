"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { toggleItem, hasItem } = useWishlistStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorited = mounted ? hasItem(product.id) : false;

  return (
    <div className="group relative flex flex-col bg-background rounded-lg hover:shadow-dark transition-all duration-300">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg bg-surface">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10">
          <span className="sr-only">عن المنتج {product.name}</span>
        </Link>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {(() => {
            const totalStock = product.colors?.reduce((sum, c) => sum + (c.stock || 0), 0) || 0;
            if (totalStock === 0) {
              return <Badge className="bg-red-500 hover:bg-red-600 font-bold border-none text-white shadow-md">انتهت الكمية</Badge>;
            }
            if (totalStock <= 5) {
              return <Badge className="bg-orange-500 hover:bg-orange-600 font-bold border-none text-white shadow-md">اقتربت على النفاذ</Badge>;
            }
            return null;
          })()}
          {product.isNew && <Badge>جديد</Badge>}
          {product.discount && <Badge variant="destructive">خصم %{product.discount}</Badge>}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product.id, user?.uid);
          }}
          className="absolute top-3 left-3 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-text hover:text-accent transition-colors shadow-sm"
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorited ? "fill-accent text-accent" : "")} />
          <span className="sr-only">أضف للمفضلة</span>
        </button>
      </div>

      <div className="flex flex-col flex-1 p-4 pb-5">
        <div className="text-xs text-muted mb-1">{product.category}</div>
        <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
          <h3 className="font-heading font-medium text-lg leading-tight mb-2 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mt-auto flex items-center gap-3">
          <span className="font-numbers text-xl font-bold text-accent">
            {product.price} د.أ
          </span>
          {product.originalPrice && (
            <span className="font-numbers text-sm text-muted line-through">
              {product.originalPrice} د.أ
            </span>
          )}
        </div>

        {/* Colors Available */}
        <div className="mt-3 flex gap-1.5">
          {product.colors.map((color: { name: string; hex: string }) => (
            <div 
              key={color.name}
              className="h-4 w-4 rounded-full border border-border/50 shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
