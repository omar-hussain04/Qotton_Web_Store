"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { CURRENCY } from "@/lib/constants";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + ((item?.product?.price || 0) * item.quantity), 0),
  [items]);

  if (!mounted) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  const handleShop = () => {
    setIsOpen(false);
    router.push("/products");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 bottom-0 left-0 w-full sm:w-[400px] bg-surface border-r border-border z-[101] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading text-2xl text-accent font-bold mt-1">السلة</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 border border-border rounded-full text-text hover:text-accent hover:border-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <ShoppingCart className="h-16 w-16 text-muted mb-4" />
              <p className="text-lg text-text font-medium mb-2">سلتك فارغة</p>
              <p className="text-sm text-muted mb-6">اكتشف مجموعتنا المميزة وأضف لعالمك لمسة من الأصالة.</p>
              <Button onClick={handleShop}>تسوّق الآن</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-background rounded-lg border border-border/50 shadow-sm relative group">
                <div className="relative w-24 h-28 rounded-md overflow-hidden flex-shrink-0 bg-surface">
                  {item?.product?.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item?.product?.name || "Product"} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-border/50 flex items-center justify-center text-center p-2 text-xs text-muted">بدون صورة / قديم</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col py-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-text text-sm line-clamp-1">{item?.product?.name || "منتج غير معروف"}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-muted mb-auto flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">اللون: 
                      {item.product?.colors?.find(c => c.name === item.selectedColor)?.hex && (
                        <span className="inline-block w-2.5 h-2.5 rounded-full outline outline-1 outline-border/50 translate-y-0.5" style={{ backgroundColor: item.product.colors.find(c => c.name === item.selectedColor)?.hex }} />
                      )}
                      <span>{item.selectedColor}</span>
                    </span>
                    <span>•</span>
                    <span>المقاس: {item.selectedSize}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-numbers text-accent font-bold">{item?.product?.price || 0} د.أ</div>
                    
                    <div className="flex items-center gap-2 bg-surface rounded-full border border-border p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-text hover:text-accent hover:bg-background transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-numbers text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-text hover:text-accent hover:bg-background transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-surface">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text font-medium">المجموع</span>
              <span className="font-numbers text-xl font-bold text-accent">{total} {CURRENCY}</span>
            </div>
            <p className="text-xs text-muted mb-4 text-center">الشحن والضرائب تُحسب عند الدفع</p>
            <Button className="w-full text-lg py-6 shadow-dark gap-2" onClick={handleCheckout}>
              <span>إتمام الطلب</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
