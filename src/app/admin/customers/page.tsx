"use client";

import { useEffect, useState } from "react";
import { getAllOrders } from "@/lib/orders";
import type { Order } from "@/types";
import { Search, MapPin, Phone, User, Calendar, DollarSign, Package, ShieldCheck, UserCircle } from "lucide-react";

interface CustomerCRM {
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: any; // Timestamp
  hasAccount: boolean;
}

import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, phone: string | null, name: string | null}>({ isOpen: false, phone: null, name: null });

  const confirmDelete = async () => {
    const { phone, name } = deleteModalState;
    if (!phone) return;

    try {
      const { deleteCustomerOrders } = await import("@/lib/orders");
      const { logActivity } = await import("@/lib/logger");
      const { auth } = await import("@/lib/firebase");
      await deleteCustomerOrders(phone);
      
      if (auth.currentUser) {
        await logActivity(
          auth.currentUser.uid,
          auth.currentUser.displayName || "مدير",
          auth.currentUser.email || "",
          "DELETE",
          `تم حذف العميل ${name} (${phone}) وجميع طلباته`
        );
      }
      
      setCustomers(prev => prev.filter(c => c.phone !== phone));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف العميل");
    } finally {
      setDeleteModalState({ isOpen: false, phone: null, name: null });
    }
  };

  useEffect(() => {
    async function loadCustomers() {
      try {
        const orders = await getAllOrders();
        
        // Group orders by phone number
        const crmMap: Record<string, CustomerCRM> = {};
        
        orders.forEach(order => {
          // Exclude cancelled orders from total spending optionally, but here we include or exclude based on taste.
          // Let's exclude cancelled orders from total spent.
          const isCancelled = order.status === "cancelled";
          const phone = order.customer?.phone;
          
          if (!phone) return;
          
          // Clean phone formatting (remove spaces for key creation)
          const cleanPhone = phone.replace(/\s+/g, '');
          
          if (!crmMap[cleanPhone]) {
            crmMap[cleanPhone] = {
              phone: order.customer.phone, // keep original formatting for display
              firstName: order.customer.firstName,
              lastName: order.customer.lastName,
              city: order.customer.city,
              address: order.customer.address,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt,
              hasAccount: !!order.userId,
            };
          }
          
          if (order.userId) {
            crmMap[cleanPhone].hasAccount = true;
          }
          
          crmMap[cleanPhone].totalOrders += 1;
          
          if (!isCancelled) {
            crmMap[cleanPhone].totalSpent += (order.totals?.finalTotal || 0);
          }
          
          // Update last order date if this order is newer
          const currentLast = crmMap[cleanPhone].lastOrderDate?.toMillis?.() || 0;
          const thisOrderTime = order.createdAt?.toMillis?.() || 0;
          
          if (thisOrderTime > currentLast) {
            crmMap[cleanPhone].lastOrderDate = order.createdAt;
            // Also update name/address to the most recent one
            crmMap[cleanPhone].firstName = order.customer.firstName;
            crmMap[cleanPhone].lastName = order.customer.lastName;
            crmMap[cleanPhone].city = order.customer.city;
            crmMap[cleanPhone].address = order.customer.address;
          }
        });
        
        // Convert to array and sort by total spent descending
        const customersArray = Object.values(crmMap);
        customersArray.sort((a, b) => b.totalSpent - a.totalSpent);
        
        setCustomers(customersArray);
      } catch (err) {
        console.error("Error loading customers:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      customer.phone.includes(term) ||
      customer.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">إدارة العملاء</h1>
          <p className="text-muted">نظرة شاملة لجميع عملائك مبنية على سجل الطلبات النشطة</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="بحث (اسم، هاتف، مدينة)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted font-medium">إجمالي العملاء</p>
            <p className="text-2xl font-bold text-text">{customers.length}</p>
          </div>
        </div>
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
                  <th className="px-6 py-4 font-medium min-w-[200px]">اسم العميل</th>
                  <th className="px-6 py-4 font-medium min-w-[150px]">التواصل والمدينة</th>
                  <th className="px-6 py-4 font-medium text-center">أخر طلب</th>
                  <th className="px-6 py-4 font-medium text-center">عدد الطلبات</th>
                  <th className="px-6 py-4 font-medium text-center">المبالغ المدفوعة</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-background/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-accent font-bold shrink-0">
                          {customer.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-text truncate max-w-[180px] mb-1">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.hasAccount ? (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-accent/10 text-accent" title="يمتلك حساب مسجل">
                              <ShieldCheck className="w-3 h-3" /> مسجل
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-surface text-muted border border-border" title="قام بالشراء كزائر">
                              <UserCircle className="w-3 h-3" /> زائر
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-muted gap-2 text-xs mb-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{customer.phone}</span>
                      </div>
                      <div className="flex items-center text-muted gap-2 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>{customer.city === 'Amman' ? 'عمان' : customer.city} - {customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-muted">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3" />
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate.toMillis()).toLocaleDateString('ar-JO') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1 rounded-full text-xs font-bold text-text">
                        <Package className="h-3 w-3 text-accent" />
                        {customer.totalOrders} {customer.totalOrders === 1 ? 'طلب' : 'طلبات'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-numbers text-accent font-bold">
                      {customer.totalSpent.toFixed(2)} د.أ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalState({ isOpen: true, phone: customer.phone, name: `${customer.firstName} ${customer.lastName}` });
                        }}
                        className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors rounded-lg font-bold text-xs"
                      >
                        حذف العميل
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      لا يوجد نتائج لعملاء مطابقين للترشيح
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="حذف العميل نهائياً"
        message={`هل أنت متأكد من حذف العميل ${deleteModalState.name} وجميع طلباته المرتبطة؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كل سجلاته.`}
        confirmText="حذف العميل"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, phone: null, name: null })}
      />
    </div>
  );
}
