"use client";

import React, { useEffect, useState, useRef } from "react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";
import { Search, MapPin, Phone, ChevronDown, ChevronUp, Package, User, MessageSquare, Printer, PrinterIcon, Copy, Check, Trash2, Download, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Link from "next/link";

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
                className={`w-full text-right px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${key === currentStatus ? config.bg + " " + config.color : "text-muted hover:bg-accent/10 hover:text-accent"}`}
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
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null });
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportYearDropdownOpen, setReportYearDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateReport = async () => {
    const reportOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const date = typeof (o.createdAt as any).toDate === 'function' 
        ? (o.createdAt as any).toDate() 
        : new Date(o.createdAt as any);
      return date.getFullYear() === reportYear && (date.getMonth() + 1) === reportMonth;
    });

    if (reportOrders.length === 0) {
      alert("لا يوجد طلبات مسجلة في هذا الشهر لتصديرها!");
      return;
    }

    setIsExporting(true);
    try {
      const rows = reportOrders.map(o => {
        const date = typeof (o.createdAt as any).toDate === 'function'
          ? (o.createdAt as any).toDate()
          : new Date(o.createdAt as any);
        const dateStr = date.toLocaleDateString('ar-JO');
        const finalTotal = o.totals?.finalTotal || 0;
        return {
          'رقم الطلب': o.id,
          'تاريخ الطلب': dateStr,
          'قيمة الطلب (د.أ)': finalTotal
        };
      });

      const { auth } = await import("@/lib/firebase");
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const response = await fetch("/api/orders/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          title: `تقرير شهر ${reportMonth}-${reportYear}`,
          rows 
        }),
      });

      if (!response.ok) throw new Error("فشل في التصدير");
      
      showToast("تم تصدير التقرير إلى الجوجل شيت بنجاح!");
      setReportModalOpen(false);
      window.open("https://docs.google.com/spreadsheets/d/1aVmv3_sNLIYH6M0Dzkd-zqtPik7h6Vxq6H9jZuRd6YE/edit?usp=sharing", "_blank");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تصدير التقرير للجوجل شيت.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast("تم نسخ الرابط بنجاح!");
  };


  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    const { orderId } = deleteModalState;
    if (!orderId) return;

    setIsDeleting(true);
    try {
      const { deleteOrder } = await import("@/lib/orders");
      const { logActivity } = await import("@/lib/logger");
      const { auth } = await import("@/lib/firebase");
      await deleteOrder(orderId);

      if (auth.currentUser) {
        await logActivity(
          auth.currentUser.uid,
          auth.currentUser.displayName || "مدير",
          auth.currentUser.email || "",
          "DELETE",
          `تم حذف الطلب رقم ${orderId}`
        );
      }

      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الطلب");
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false, orderId: null });
    }
  };

  const handlePrint = (orderId: string) => {
    setPrintOrderId(orderId);
    
    // Temporarily change document title so that when saved as PDF, it uses the Order ID
    const originalTitle = document.title;
    document.title = `فاتورة-طلب-${orderId.substring(0, 8).toUpperCase()}`;

    setTimeout(() => {
      window.print();
      // Restore original title
      document.title = originalTitle;
      setPrintOrderId(null);
    }, 200);
  };

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
    <div className="pb-10 bg-background min-h-screen">
      {/* Non-printable UI wrapper */}
      <div className="print:hidden space-y-6">
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
          <a
            href="https://docs.google.com/spreadsheets/d/1aVmv3_sNLIYH6M0Dzkd-zqtPik7h6Vxq6H9jZuRd6YE/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-lg font-bold text-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            عرض الجوجل شيت
          </a>
          <Button onClick={() => setReportModalOpen(true)} className="shrink-0 gap-2 font-bold text-xs px-4">
            <Download className="w-4 h-4" />
            تصدير تقرير شهري
          </Button>
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

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-visible">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
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
                            <div className="flex items-center justify-end gap-2">
                              {order.status === 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModalState({ isOpen: true, orderId: order.id });
                                  }}
                                  className="h-8 px-2.5 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 rounded-md"
                                  title="حذف نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <Button variant="outline" className="expand-btn h-8 text-xs gap-1 pointer-events-none">
                                {isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                            </div>
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
                                  <div className="divide-y divide-border/30">
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between py-2.5">
                                        <div>
                                          <div className="font-bold text-sm text-text">{item.name}</div>
                                          <div className="text-xs text-muted mt-0.5">اللون: {item.selectedColor} | المقاس: {item.selectedSize}</div>
                                        </div>
                                        <div className="text-left font-mono">
                                          <div className="text-sm font-bold text-text">{item.quantity} × {item.price.toFixed(2)}</div>
                                          <div className="text-xs text-accent font-bold">{(item.quantity * item.price).toFixed(2)} د.أ</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-end pt-3 border-t border-border/50">
                                    <div className="w-56 space-y-1.5 text-sm">
                                      <div className="flex justify-between text-muted"><p>المجموع الفرعي:</p> <p className="font-mono">{order.totals?.subtotal?.toFixed(2)} د.أ</p></div>
                                      <div className="flex justify-between text-muted"><p>رسوم التوصيل:</p> <p className="font-mono">{order.totals?.shipping?.toFixed(2)} د.أ</p></div>
                                      <div className="flex justify-between text-text font-bold text-base pt-2"><p>المجموع الكلي:</p> <p className="font-mono text-accent">{order.totals?.finalTotal?.toFixed(2)} د.أ</p></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column - Customer Info & Actions */}
                                <div className="bg-surface/50 border border-border p-4 rounded-xl flex flex-col h-full">
                                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <User className="w-4 h-4 text-accent" />
                                    <h3 className="font-bold text-sm text-text">بيانات العميل</h3>
                                  </div>
                                  
                                  <div className="space-y-4 text-sm flex-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-muted text-[11px] uppercase tracking-wider">الاسم المستلم</span>
                                      <span className="font-bold text-text">{order.customer?.firstName} {order.customer?.lastName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-muted text-[11px] uppercase tracking-wider">رقم الهاتف</span>
                                      <span dir="ltr" className="font-mono font-bold w-fit text-text">{order.customer?.phone}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-muted text-[11px] uppercase tracking-wider">المدينة والتوصيل</span>
                                      <span className="font-medium text-sm text-text/90 leading-relaxed">{order.customer?.city === 'Amman' ? 'عمان' : order.customer?.city} - {order.customer?.address}</span>
                                    </div>

                                    {order.customer?.location && (() => {
                                      const mapLink = `https://www.google.com/maps?q=${order.customer.location.lat},${order.customer.location.lng}`;
                                      return (
                                        <div className="flex gap-2 pt-1">
                                          <a
                                            href={mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-primary transition-colors rounded-lg font-bold text-xs"
                                          >
                                            <MapPin className="w-3.5 h-3.5" />
                                            الموقع على الخريطة
                                          </a>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopyLink(mapLink);
                                            }}
                                            className="px-3 py-2 bg-background border border-border hover:bg-surface text-text rounded-lg transition-colors flex items-center justify-center"
                                            title="نسخ الرابط"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {order.customer?.notes && (
                                      <div className="p-2.5 bg-accent/5 border border-accent/10 rounded-lg text-xs mt-2">
                                        <strong className="text-accent block mb-1">ملاحظات التوصيل:</strong> 
                                        <span className="text-text/80">{order.customer.notes}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
                                    <a
                                      href={`https://wa.me/${order.customer?.phone?.replace(/^0/, "962")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors rounded-lg font-bold text-xs"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      مراسلة عبر واتساب
                                    </a>
                                    <button
                                      onClick={() => handlePrint(order.id)}
                                      className="flex items-center justify-center gap-1.5 py-2 bg-background border border-border hover:bg-accent hover:border-accent hover:text-primary transition-all duration-300 rounded-lg font-bold text-xs"
                                    >
                                      <PrinterIcon className="w-3.5 h-3.5" />
                                      طباعة
                                    </button>
                                    <Link
                                      href={`/admin/orders/${order.id}`}
                                      className="flex items-center justify-center gap-1.5 py-2 bg-background border border-border hover:bg-accent hover:border-accent hover:text-primary transition-all duration-300 rounded-lg font-bold text-xs"
                                    >
                                      صفحة الطلب
                                    </Link>
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

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="حذف الطلب نهائياً"
        message={`هل أنت متأكد من حذف الطلب رقم ${deleteModalState.orderId} بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف نهائياً"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, orderId: null })}
        isLoading={isDeleting}
      />
      </div>

      {/* Printable Invoice Container */}
      {printOrderId && (() => {
        const orderToPrint = orders.find(o => o.id === printOrderId);
        if (!orderToPrint) return null;

        return (
          <div id="printable-invoice" dir="rtl" className="hidden print:flex flex-col bg-white text-black font-sans relative box-border">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-2 tracking-tight">قطن</h1>
                <p className="text-gray-600 text-base font-medium mb-1">متجر ملابس أردنية أصيلة</p>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">+962 7 9841 9463</span>
                </p>
              </div>
              <div className="text-left flex flex-col items-end">
                <h2 className="text-3xl font-bold text-gray-800 mb-3 border-b-4 border-gray-800 inline-block pb-1">إيصال طلب</h2>
                <div className="bg-gray-100 p-3 rounded-lg text-right min-w-[200px] border border-gray-200 shadow-sm">
                  <p className="font-bold text-sm mb-2 flex justify-between"><span className="text-gray-500">رقم الطلب:</span> <span dir="ltr">#{orderToPrint.id.substring(0, 8).toUpperCase()}</span></p>
                  <p className="font-bold text-sm flex justify-between"><span className="text-gray-500">التاريخ:</span> <span>{orderToPrint.createdAt ? new Date(orderToPrint.createdAt.toMillis()).toLocaleDateString('ar-JO') : "-"}</span></p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-8 bg-gray-50 p-5 border border-gray-200 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-black"></div>
              <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                بيانات العميل
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <p className="mb-2"><span className="font-bold text-gray-500 block text-xs mb-1">اسم المستلم:</span> <span className="font-bold text-base">{orderToPrint.customer?.firstName} {orderToPrint.customer?.lastName}</span></p>
                  <p><span className="font-bold text-gray-500 block text-xs mb-1">رقم الهاتف:</span> <span dir="ltr" className="font-bold text-base">{orderToPrint.customer?.phone}</span></p>
                </div>
                <div>
                  <p className="mb-2"><span className="font-bold text-gray-500 block text-xs mb-1">المدينة:</span> <span className="font-bold text-base">{orderToPrint.customer?.city === 'Amman' ? 'عمان' : orderToPrint.customer?.city}</span></p>
                  <p><span className="font-bold text-gray-500 block text-xs mb-1">العنوان التفصيلي:</span> <span className="font-bold text-base">{orderToPrint.customer?.address}</span></p>
                </div>
              </div>
              {orderToPrint.customer?.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm"><span className="font-bold text-gray-500">ملاحظات التوصيل:</span> {orderToPrint.customer.notes}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                محتويات الطلب
              </h3>
              <table className="w-full text-sm border-collapse mb-8">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="py-3 px-4 text-right font-bold w-1/2 rounded-r-lg">المنتج</th>
                    <th className="py-3 px-4 text-center font-bold border-r border-gray-700">الكمية</th>
                    <th className="py-3 px-4 text-center font-bold border-r border-gray-700">السعر</th>
                    <th className="py-3 px-4 text-left font-bold rounded-l-lg border-r border-gray-700">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {orderToPrint.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-4 px-4">
                        <div className="font-bold text-base">{item.name}</div>
                        <div className="text-gray-500 text-xs mt-1">اللون: {item.selectedColor} | المقاس: {item.selectedSize}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-lg">{item.quantity}</td>
                      <td className="py-4 px-4 text-center text-gray-600 font-mono">{item.price.toFixed(2)} د.أ</td>
                      <td className="py-4 px-4 text-left font-bold font-mono">{(item.quantity * item.price).toFixed(2)} د.أ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-8 print:break-inside-avoid">
                <div className="w-1/2 bg-gray-50 p-5 border border-gray-200 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-gray-400"></div>
                  <div className="flex justify-between mb-3 pb-3 border-b border-gray-200 text-sm">
                    <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
                    <span className="font-bold font-mono">{orderToPrint.totals?.subtotal?.toFixed(2)} د.أ</span>
                  </div>
                  <div className="flex justify-between mb-3 pb-3 border-b border-gray-200 text-sm">
                    <span className="text-gray-600 font-bold">رسوم التوصيل:</span>
                    <span className="font-bold font-mono">{orderToPrint.totals?.shipping?.toFixed(2)} د.أ</span>
                  </div>
                  <div className="flex justify-between mt-2 text-xl bg-black text-white p-3 rounded-lg -mx-1 mb-[-4px]">
                    <span className="font-bold">المجموع الكلي:</span>
                    <span className="font-bold font-mono">{orderToPrint.totals?.finalTotal?.toFixed(2)} د.أ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with QR Code */}
            <div className="mt-auto pt-6 border-t-2 border-gray-300 flex justify-between items-center print:break-inside-avoid">
              <div className="text-right">
                <p className="font-bold text-2xl mb-2 text-black">شكراً لتسوقكم من قطن!</p>
                <p className="text-gray-600 mb-3 text-lg">خيطٌ يَنسجُ لأثرٍ يَبقى</p>
                <p className="text-gray-400 text-xs mt-4">تم إنشاء هذا الإيصال إلكترونياً ولا يحتاج إلى ختم أو توقيع.</p>
              </div>

              <div className="flex flex-col items-center border border-gray-200 p-3 rounded-xl bg-gray-50 shadow-sm">
                <p className="text-xs font-bold text-gray-600 mb-2">تابعنا على إنستجرام</p>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://instagram.com/qottonjo"
                  alt="Instagram QR Code"
                  className="w-24 h-24 mb-1"
                />
                <span className="text-sm font-bold text-black mt-1" dir="ltr">@qottonjo</span>
              </div>
            </div>

            {/* Global Print Styles to force exactly one A4 page without headers/footers */}
            <style dangerouslySetInnerHTML={{
              __html: `
              @media print {
                @page { 
                  size: A4 portrait; 
                  margin: 0;
                }
                body { 
                  margin: 0; 
                  background: white; 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #printable-invoice { 
                  margin: 0 !important; 
                  padding: 15mm 20mm !important; 
                  width: 210mm !important; 
                  height: 297mm !important; 
                  box-sizing: border-box !important;
                }
                /* Hide nextjs dev overlays */
                nextjs-portal { display: none !important; }
              }
            `}} />
          </div>
        );
      })()}

      {/* Beautiful Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface border border-accent/20 text-text px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-[100]"
          >
            <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReportModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold font-heading mb-6 text-text flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  إرسال التقرير الشهري للجوجل شيت
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-muted mb-2 block">اختر السنة</label>
                    <div className="relative">
                      <button
                        onClick={() => setReportYearDropdownOpen(!reportYearDropdownOpen)}
                        className="w-full bg-background border border-border rounded-lg p-3 text-text hover:border-accent outline-none font-numbers transition-colors flex items-center justify-between"
                      >
                        <span>{reportYear}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${reportYearDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {reportYearDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-10"
                          >
                            {[2026, 2027, 2028, 2029, 2030].map((year) => (
                                <button
                                  key={year}
                                  onClick={() => {
                                    setReportYear(year);
                                    setReportYearDropdownOpen(false);
                                  }}
                                  className={`w-full text-right px-4 py-3 font-numbers transition-colors ${reportYear === year ? 'bg-accent/10 text-accent font-bold' : 'text-text hover:bg-background'}`}
                                >
                                  {year}
                                </button>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted mb-2 block">اختر الشهر</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <button key={m} onClick={() => setReportMonth(m)} className={`p-2 rounded-lg text-sm font-bold transition-all font-numbers ${reportMonth === m ? 'bg-accent text-primary shadow-md shadow-accent/20' : 'bg-background border border-border text-muted hover:border-accent hover:text-text'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background px-6 py-4 flex items-center gap-3 border-t border-border">
                <button onClick={() => setReportModalOpen(false)} className="flex-1 py-2 font-bold text-sm text-text border border-border rounded-lg hover:bg-surface transition-colors" disabled={isExporting}>إلغاء</button>
                <button onClick={handleGenerateReport} disabled={isExporting} className="flex-1 py-2 font-bold text-sm bg-accent text-primary rounded-lg hover:bg-accent-light transition-colors flex items-center justify-center gap-2">
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Download className="w-4 h-4" /> إرسال للجوجل شيت</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
