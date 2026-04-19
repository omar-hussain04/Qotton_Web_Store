"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Archive,
  Users
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Tags },
  { href: "/admin/inventory", label: "المخزون", icon: Archive },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/messages", label: "الرسائل", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubscribe: () => void;
    
    async function listenToMessages() {
      const { collection, query, where, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const q = query(collection(db, "messages"), where("isRead", "==", false));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      });
    }
    
    listenToMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-background border border-border rounded-md shadow-md text-text"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar background overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-background border-l border-border flex flex-col transition-transform z-40 ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-border flex items-center justify-center">
          <Link href="/admin" onClick={() => setIsOpen(false)}>
            <Image src="/qotton_logo.png" alt="Qotton Admin" width={100} height={50} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/admin" 
              ? pathname === "/admin" 
              : pathname?.startsWith(link.href);

            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? "bg-accent text-primary" 
                    : "text-text hover:bg-surface hover:text-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
                {link.href === "/admin/messages" && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full font-bold">
                    {unreadCount > 99 ? "+99" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-muted hover:text-text transition-colors rounded-lg hover:bg-surface font-medium w-full"
          >
            <LogOut className="h-5 w-5" />
            العودة للمتجر
          </Link>
        </div>
      </aside>
    </>
  );
}
