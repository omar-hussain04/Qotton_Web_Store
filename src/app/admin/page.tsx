"use client";

import { useEffect, useState } from "react";
import { getAllOrders } from "@/lib/orders";
import { getProducts } from "@/lib/products";
import { getMessages } from "@/lib/messages";
import type { Order, Product, ContactMessage } from "@/types";
import { Package, ShoppingBag, Tags, MessageSquare, DollarSign } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<(ContactMessage & { id: string; createdAt?: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedOrders, fetchedProducts, fetchedMessages] = await Promise.all([
          getAllOrders(),
          getProducts(),
          getMessages(),
        ]);
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const activeOrders = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.totals?.finalTotal || 0), 0);
  const totalProfit = activeOrders.reduce((sum, order) => sum + (order.totals?.netProfit || 0), 0);
  
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text mb-2">لوحة التحكم</h1>
        <p className="text-muted">مرحباً بك، النظرة العامة لأداء المتجر.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1 font-medium">إجمالي الإيرادات</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-text">{totalRevenue.toFixed(0)} د.أ</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0 ml-2">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1 font-medium">الطلبات الكلية</p>
            <p className="text-2xl font-bold text-text">{orders.length}</p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1 font-medium">المنتجات</p>
            <p className="text-2xl font-bold text-text">{products.length}</p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <Tags className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1 font-medium">صافي الأرباح</p>
            <p className="text-2xl font-bold text-accent">{totalProfit.toFixed(0)} د.أ</p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Orders Preview Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-heading">أحدث الطلبات</h2>
            {pendingOrders > 0 && (
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded-full font-medium">
                {pendingOrders} قيد الانتظار
              </span>
            )}
          </div>
          <Link href="/admin/orders" className="text-sm font-bold text-accent hover:text-accent-light transition-colors flex items-center gap-1 bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg">
            عرض كل الطلبات
          </Link>
        </div>
        <div className="overflow-x-auto text-right">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background text-muted border-b border-border">
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted">{order.id}</td>
                  <td className="px-6 py-4 text-text">{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'غير معروف'}</td>
                  <td className="px-6 py-4 text-muted">
                    {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString('ar-JO') : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-accent">{order.totals?.finalTotal?.toFixed(2)} د.أ</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                      ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 
                        order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400' : 
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 
                        'bg-orange-500/10 text-orange-400'}`}>
                      {order.status === 'delivered' ? 'اكتمل' : 
                       order.status === 'shipped' ? 'جاري التوصيل' : 
                       order.status === 'cancelled' ? 'ملغي' : 
                       order.status === 'processing' ? 'قيد المعالجة' : 'قيد الانتظار'}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    لا يوجد طلبات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
