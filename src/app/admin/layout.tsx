import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | قطن",
  description: "لوحة تحكم متجر قطن",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-surface">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
