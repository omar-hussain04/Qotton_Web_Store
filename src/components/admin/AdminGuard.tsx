"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/account?redirect=/admin");
      } else if (!isAdmin) {
        // Logged in but not an admin, redirect to home
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted font-medium animate-pulse">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="bg-background p-8 rounded-2xl border border-border shadow-xl max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-text">غير مصرح لك بالدخول</h1>
          <p className="text-muted leading-relaxed">
            عذراً، هذه المنطقة مخصصة لإدارة المتجر فقط. يرجى تسجيل الدخول بحساب مشرف للمتابعة.
          </p>
          <div className="pt-4">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted">سيتم تحويلك تلقائياً خلال لحظات...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
