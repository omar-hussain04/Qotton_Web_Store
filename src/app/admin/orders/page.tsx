"use client";

import React, { useEffect, useState, useRef } from "react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";
import { Search, MapPin, Phone, ChevronDown, ChevronUp, Package, User, MessageSquare, Printer, PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

// Status configuration map for easy styling and translation
const STATUS_MAP: Record<OrderStatus, { label: string, color: string, bg: string, border: string }> = {
  pending: { label: "قيد الانتظار", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  processing: { label: "قيد المعالجة", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  shipped: { label: "تم الشحن", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  delivered: { label: "مكتمل", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  cancelled: { label: "ملغي", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

// Custom Dropdown Component
function StatusDropdown({ currentStatus, onChange, disabled }: { currentStatus: OrderStatus, onChange: (s: OrderStatus) => void, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = STATUS_MAP[currentStatus];

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <button
        onClick={(e) => { e.stopPropagation(); if (!disabled) setIsOpen(!isOpen); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${currentConfig.bg} ${currentConfig.color} ${currentConfig.border} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
      >
        <span>{currentConfig.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-36 rounded-lg shadow-xl bg-surface border border-border overflow-hidden right-0">
          <div className="py-1">
            {(Object.entries(STATUS_MAP) as [OrderStatus, typeof STATUS_MAP[OrderStatus]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-4 py-2 text-xs font-bold transition-colors hover:bg-background flex items-center justify-between ${key === currentStatus ? config.bg + " " + config.color : "text-text"}`}
              >
                {config.label}
                {key === currentStatus && <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders => {
        const mapped = prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order);
        
        // Re-apply sorting immediately to push down completed orders
        mapped.sort((a, b) => {
          const isCompletedA = a.status === 'delivered' || a.status === 'cancelled';
          const isCompletedB = b.status === 'delivered' || b.status === 'cancelled';

          if (isCompletedA && !isCompletedB) return 1;
          if (!isCompletedA && isCompletedB) return -1;

          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        return mapped;
      });
    } catch (error) {
      console.error("Failed to update status", error);
      alert("حدث خطأ أثناء تحديث حالة الطلب");
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    // Prevent toggling if the click originated from a button inside the tr
    if ((e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).classList.contains('expand-btn')) return;
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const filteredOrders = orders.filter(order => {
    // Filter by text search
    let matchesSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.toLowerCase();
      matchesSearch = order.id.toLowerCase().includes(term) ||
                      fullName.includes(term) ||
                      (order.customer?.phone || '').includes(term);
    }
    
    // Filter by status
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">إدارة الطلبات</h1>
          <p className="text-muted">عرض وتحديث حالات طلبات العملاء</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="بحث (اسم، هاتف، رقم الطلب)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
        <button 
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${statusFilter === "all" ? "bg-accent border-accent text-primary" : "bg-transparent border-border text-muted hover:text-text"}`}
        >
          الكل ({orders.length})
        </button>
        {Object.entries(STATUS_MAP).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <button 
              key={key}
              onClick={() => setStatusFilter(key as OrderStatus)}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${statusFilter === key ? config.bg + " " + config.border + " " + config.color : "bg-transparent border-border text-muted hover:text-text"}`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="bg-background text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium min-w-[200px]">العميل / التواصل</th>
                  <th className="px-6 py-4 font-medium">المدينة</th>
                  <th className="px-6 py-4 font-medium">الإجمالي</th>
                  <th className="px-6 py-4 font-medium min-w-[150px]">الحالة</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  
                  return (
                    <React.Fragment key={order.id}>
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ layout: { duration: 0.4, type: "spring", bounce: 0.2 } }}
                        onClick={(e: any) => toggleExpand(order.id, e)} 
                        className={`hover:bg-background/50 transition-colors group cursor-pointer ${isExpanded ? "bg-background/30" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-text mb-1">{order.customer?.firstName} {order.customer?.lastName}</div>
                          <div className="flex items-center text-muted gap-2 text-xs">
                            <Phone className="h-3 w-3" />
                            <span dir="ltr">{order.customer?.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted" />
                            {order.customer?.city === 'Amman' ? 'عمان' : order.customer?.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-accent">
                          {order.totals?.finalTotal?.toFixed(2)} د.أ
                        </td>
                        <td className="px-6 py-4">
                          <StatusDropdown 
                            currentStatus={order.status} 
                            onChange={(newStatus) => handleStatusChange(order.id, newStatus)} 
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button variant="outline" className="expand-btn h-8 text-xs gap-1 pointer-events-none">
                            {isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-background/40">
                          <td colSpan={5} className="px-6 py-6 border-b-2 border-accent/20">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                              
                              {/* Left/Main Column - Order Items */}
                              <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-accent" />
                                    <h3 className="font-bold text-text">محتويات الطلب <span className="text-muted font-normal text-sm">(رقم {order.id})</span></h3>
                                  </div>
                                  <span className="text-xs text-muted font-mono">{order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString('ar-JO') : "-"}</span>
                                </div>
                                <div className="space-y-3">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                                      <div>
                                        <div className="font-bold text-sm text-text">{item.name}</div>
                                        <div className="text-xs text-muted mt-1">اللون: {item.selectedColor} | المقاس: {item.selectedSize}</div>
                                      </div>
                                      <div className="text-left font-mono">
                                        <div className="text-sm font-bold text-text">{item.quantity} × {item.price.toFixed(2)}</div>
                                        <div className="text-xs text-accent font-bold">{(item.quantity * item.price).toFixed(2)} د.أ</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-end p-4 bg-surface border border-border rounded-lg mt-4">
                                  <div className="w-64 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted"><p>المجموع الفرعي:</p> <p className="font-mono">{order.totals?.subtotal?.toFixed(2)} د.أ</p></div>
                                    <div className="flex justify-between text-muted"><p>التوصيل:</p> <p className="font-mono">{order.totals?.shipping?.toFixed(2)} د.أ</p></div>
                                    <div className="flex justify-between text-text font-bold text-base pt-2 border-t border-border"><p>المجموع الكلي:</p> <p className="font-mono text-accent">{order.totals?.finalTotal?.toFixed(2)} د.أ</p></div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column - Customer Info & Actions */}
                              <div className="space-y-4">
                                <div className="bg-surface border border-border p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <User className="w-5 h-5 text-accent" />
                                    <h3 className="font-bold text-text">بيانات العميل</h3>
                                  </div>
                                  <div className="space-y-2 text-sm text-text">
                                    <p><strong className="text-muted block text-xs">الاسم المستلم:</strong> {order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p><strong className="text-muted block text-xs">رقم الهاتف:</strong> <span dir="ltr" className="font-mono">{order.customer?.phone}</span></p>
                                    <p><strong className="text-muted block text-xs">المدينة و التوصيل:</strong> {order.customer?.city === 'Amman' ? 'عمان' : order.customer?.city} - {order.customer?.address}</p>
                                    {order.customer?.notes && (
                                      <div className="mt-2 p-2 bg-accent/10 border border-accent/20 rounded text-xs text-accent">
                                        <strong>ملاحظات التعميل:</strong> {order.customer.notes}
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-6 flex flex-col gap-2">
                                    <a 
                                      href={`https://wa.me/${order.customer?.phone?.replace(/^0/, "962")}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white transition-colors rounded-lg font-bold text-sm"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      مراسلة العميل (واتساب)
                                    </a>
                                    <button 
                                      onClick={() => window.print()}
                                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-background border border-border hover:bg-surface text-text transition-colors rounded-lg font-bold text-sm"
                                    >
                                      <PrinterIcon className="w-4 h-4" />
                                      طباعة إيصال الطلب
                                    </button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted">
                        <Package className="w-12 h-12 mb-4 opacity-50" />
                        <span className="font-bold text-lg">لا يوجد نتائج مطابقة للبحث أو الفلتر المنشط</span>
                      </div>
                    </td>
                  </tr>
                )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
