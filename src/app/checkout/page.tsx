"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ChevronRight, Banknote, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { CURRENCY, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  // Profile auto-fill state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved profile when user is logged in
  useEffect(() => {
    async function loadProfile() {
      if (user && !profileLoaded) {
        try {
          const { getUserProfile } = await import("@/lib/db");
          const profile = await getUserProfile(user.uid);
          if (profile) {
            if (profile.firstName) setFirstName(profile.firstName);
            if (profile.lastName) setLastName(profile.lastName);
            if (profile.phone) setPhone(profile.phone);
            if (profile.city) setCity(profile.city);
            if (profile.address) setAddress(profile.address);
          }
          setProfileLoaded(true);
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      }
    }
    loadProfile();
  }, [user, profileLoaded]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + (item.product.costPrice || 0) * item.quantity, 0);
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const finalTotal = total + shipping;
  const netProfit = total - totalCost;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const customerData = {
        firstName,
        lastName,
        phone,
        city,
        address,
      };

      const orderData = {
        customer: customerData,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          costPrice: item.product.costPrice || 0,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        totals: {
          subtotal: total,
          shipping: shipping,
          finalTotal: finalTotal,
          totalCost: totalCost,
          netProfit: netProfit
        }
      };

      const { createOrder, saveUserProfile } = await import("@/lib/db");
      const orderId = await createOrder(orderData, user?.uid);
      
      // Save address to user profile for future auto-fill
      if (user) {
        await saveUserProfile(user.uid, {
          firstName,
          lastName,
          phone,
          city,
          address,
          email: user.email || undefined,
        });
      }

      clearCart();
      setIsSubmitting(false);
      router.push(`/order-success?orderId=${orderId}`);
    } catch (err) {
      console.error("Order submission failed:", err);
      setError("عذراً، حدث خطأ أثناء إتمام الطلب! تأكد من اتصالك بالإنترنت أو إعدادات قاعدة البيانات.");
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-heading text-4xl text-accent mb-4">السلة فارغة</h1>
        <p className="text-muted mb-8">يرجى إضافة منتجات للسلة لإتمام الطلب.</p>
        <Link href="/products" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors bg-accent text-primary hover:bg-accent-light shadow-dark h-10 px-4 py-2">
          العودة للتسوق
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-8 transition-colors">
        <ChevronRight className="h-4 w-4" /> العودة للتسوق
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h1 className="font-heading text-3xl font-bold text-text mb-8">إتمام الطلب</h1>
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Shipping Info */}
            <section className="bg-surface p-6 rounded-lg border border-border/50">
              <h2 className="font-heading text-xl text-accent mb-6 font-semibold">١. بيانات المستلم</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">الاسم الأول</label>
                  <input name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-background border border-border rounded-sm h-12 px-4 text-text focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">الاسم الأخير</label>
                  <input name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-background border border-border rounded-sm h-12 px-4 text-text focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-text">رقم الجوال</label>
                  <input name="phone" required type="tel" dir="ltr" placeholder="+962 7X XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-border rounded-sm h-12 px-4 text-text focus:outline-none focus:ring-2 focus:ring-accent text-right" />
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="bg-surface p-6 rounded-lg border border-border/50">
              <h2 className="font-heading text-xl text-accent mb-6 font-semibold">٢. عنوان التوصيل</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-text">المدينة</label>
                  <select name="city" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-border rounded-sm h-12 px-4 text-text focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                    <option value="" className="text-[#4A3219]">اختر المحافظة...</option>
                    <option value="عمان" className="text-[#4A3219]">عمان</option>
                    <option value="إربد" className="text-[#4A3219]">إربد</option>
                    <option value="الزرقاء" className="text-[#4A3219]">الزرقاء</option>
                    <option value="العقبة" className="text-[#4A3219]">العقبة</option>
                    <option value="البلقاء" className="text-[#4A3219]">البلقاء</option>
                    <option value="الكرك" className="text-[#4A3219]">الكرك</option>
                    <option value="المفرق" className="text-[#4A3219]">المفرق</option>
                    <option value="مأدبا" className="text-[#4A3219]">مأدبا</option>
                    <option value="عجلون" className="text-[#4A3219]">عجلون</option>
                    <option value="جرش" className="text-[#4A3219]">جرش</option>
                    <option value="معان" className="text-[#4A3219]">معان</option>
                    <option value="الطفيلة" className="text-[#4A3219]">الطفيلة</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-text">العنوان التفصيلي (الحي، الشارع)</label>
                  <input name="address" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-background border border-border rounded-sm h-12 px-4 text-text focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-surface p-6 rounded-lg border border-border/50">
              <h2 className="font-heading text-xl text-accent mb-6 font-semibold">٣. طريقة الدفع</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-accent/20 bg-accent/5 rounded-sm cursor-pointer transition-colors">
                  <input type="radio" name="payment" value="cod" defaultChecked className="text-accent focus:ring-accent scale-125 accent-accent" />
                  <Banknote className="text-accent h-5 w-5" />
                  <span className="font-medium text-text">الدفع نقداً عند الاستلام</span>
                </label>
              </div>
            </section>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface p-6 rounded-lg border border-border/50 sticky top-24">
            <h2 className="font-heading text-xl text-text mb-6 font-bold">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text line-clamp-1 flex-1 ml-2">{item.quantity}x {item.product.name}</span>
                  <span className="font-numbers text-accent font-medium whitespace-nowrap">{item.product.price * item.quantity} د.أ</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-muted text-sm relative">
                <span>المجموع الفرعي</span>
                <span className="font-numbers">{total} د.أ</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>الشحن</span>
                <span className="font-numbers">{shipping === 0 ? "مجاني" : `${shipping} د.أ`}</span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 mb-4">
              <div className="flex justify-between items-center text-text font-bold">
                <span className="text-lg">الإجمالي</span>
                <span className="font-numbers text-2xl text-accent">{finalTotal} د.أ</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md mb-4 text-center">
                {error}
              </div>
            )}

            <Button type="submit" form="checkout-form" size="lg" disabled={isSubmitting} className="w-full text-lg h-14 shadow-dark">
              {isSubmitting ? "جاري التأكيد..." : "تأكيد الطلب"}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4" />
              تسوق آمن ومشفر 100%
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
