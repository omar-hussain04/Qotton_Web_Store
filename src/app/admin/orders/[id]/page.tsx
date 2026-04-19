"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";
import { ChevronRight, Printer, Package, MapPin, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (typeof id === 'string') {
        const data = await getOrderById(id);
        setOrder(data);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="flex h-full items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted mb-4">الطلب غير موجود</h2>
        <Button onClick={() => router.push("/admin/orders")}>العودة للطلبات</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 bg-surface border border-border rounded-lg text-muted hover:text-text transition-colors">
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text mb-1">الطلب #{order.id}</h1>
            <span className="text-sm text-muted block">
              تم الإنشاء: {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString('ar-JO') : '-'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className={`text-sm font-bold px-4 py-2 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 ${statusColors[order.status]}`}
          >
            <option value="pending" className="text-background bg-text">قيد الانتظار</option>
            <option value="processing" className="text-background bg-text">قيد المعالجة</option>
            <option value="shipped" className="text-background bg-text">تم الشحن</option>
            <option value="delivered" className="text-background bg-text">مكتمل</option>
            <option value="cancelled" className="text-background bg-text">ملغي</option>
          </select>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 shrink-0 hidden md:flex">
            <Printer className="w-4 h-4" />
            طباعة الفاتورة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg font-heading">معلومات العميل</h2>
          </div>
          <div className="space-y-3 text-sm">
            <p><span className="text-muted block mb-1">الاسم:</span> <strong className="text-text">{order.customer?.firstName} {order.customer?.lastName}</strong></p>
            <p><span className="text-muted block mb-1">رقم الهاتف:</span> <strong className="text-text font-mono" dir="ltr">{order.customer?.phone}</strong></p>
            <a 
              href={`https://wa.me/${order.customer?.phone?.replace(/^0/, "962")}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors rounded-lg font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              مراسلة عبر واتساب
            </a>
          </div>
        </div>

        {/* Shipping Info Card */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg font-heading">معلومات التوصيل</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted block mb-1">المدينة:</span> 
              <strong className="text-text">{order.customer?.city === 'Amman' ? 'عمان' : order.customer?.city}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted block mb-1">العنوان بالتفصيل:</span> 
              <strong className="text-text">{order.customer?.address}</strong>
            </div>
            {order.customer?.notes && (
              <div className="sm:col-span-2 bg-accent/5 max-w-full p-3 rounded border border-accent/20">
                <span className="text-muted block mb-1">ملاحظات العميل:</span> 
                <p className="text-text">{order.customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg font-heading">محتويات الطلب</h2>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-background text-muted border-b border-border">
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الكمية</th>
                <th className="px-6 py-4 font-medium">السعر</th>
                <th className="px-6 py-4 font-medium">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items?.map((item, index) => (
                <tr key={index} className="hover:bg-background/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text">{item.name}</div>
                    <div className="text-muted text-xs mt-1">اللون: {item.selectedColor} | المقاس: {item.selectedSize}</div>
                  </td>
                  <td className="px-6 py-4 text-text font-mono">{item.quantity}</td>
                  <td className="px-6 py-4 text-text font-mono">{(item.price).toFixed(2)} د.أ</td>
                  <td className="px-6 py-4 text-accent font-bold font-mono">{(item.price * item.quantity).toFixed(2)} د.أ</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-background border-t border-border">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-left font-medium text-muted">المجموع الفرعي</td>
                <td className="px-6 py-3 font-bold font-mono">{order.totals?.subtotal?.toFixed(2)} د.أ</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-left font-medium text-muted">رسوم التوصيل</td>
                <td className="px-6 py-3 font-bold font-mono">{order.totals?.shipping?.toFixed(2)} د.أ</td>
              </tr>
              <tr className="text-lg">
                <td colSpan={3} className="px-6 py-4 text-left font-bold text-text">المجموع الكلي</td>
                <td className="px-6 py-4 font-bold text-accent font-mono">{order.totals?.finalTotal?.toFixed(2)} د.أ</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
