"use client";

import { useState, useEffect } from "react";
import { getUserByEmail, changeUserRole, getAdmins } from "@/lib/users";
import { logActivity } from "@/lib/logger";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserProfile } from "@/types";
import { Shield, Search, UserCheck, UserX, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminsPage() {
  const { user, profile } = useAuth();
  const [emailQuery, setEmailQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string, profile: UserProfile } | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [admins, setAdmins] = useState<{ id: string, profile: UserProfile }[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const fetchedAdmins = await getAdmins();
    setAdmins(fetchedAdmins);
    setLoadingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    
    const result = await getUserByEmail(emailQuery.trim().toLowerCase());
    if (result) {
      setSearchResult(result);
    } else {
      setSearchError("لم يتم العثور على مستخدم بهذا البريد الإلكتروني.");
    }
    setIsSearching(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user', userEmail: string) => {
    if (!user || !profile) return;
    
    // Prevent self-demotion just in case
    if (userId === user.uid && newRole === 'user') {
      alert("لا يمكنك إزالة صلاحياتك بنفسك.");
      return;
    }

    try {
      await changeUserRole(userId, newRole);
      await logActivity(
        user.uid,
        user.displayName || profile.firstName || "مدير",
        user.email || "",
        "UPDATE",
        `تم تغيير صلاحية المستخدم ${userEmail} إلى ${newRole === 'admin' ? 'مشرف' : 'مستخدم'}`
      );
      
      // Refresh UI
      if (searchResult && searchResult.id === userId) {
        setSearchResult({ ...searchResult, profile: { ...searchResult.profile, role: newRole } });
      }
      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تغيير الصلاحيات.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl text-accent">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">إدارة الصلاحيات</h1>
          <p className="text-muted">منح وإلغاء صلاحيات المشرفين</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search and Assign Block */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-text mb-4">البحث عن مستخدم</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                placeholder="أدخل البريد الإلكتروني..."
                className="w-full h-12 pr-10 pl-4 rounded-lg border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                dir="ltr"
              />
              <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="h-12 px-6 bg-accent text-primary font-bold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? <RefreshCw className="h-5 w-5 animate-spin" /> : "بحث"}
            </button>
          </form>

          {searchError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5" />
              <p>{searchError}</p>
            </div>
          )}

          {searchResult && (
            <div className="p-4 border border-border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-text">{searchResult.profile.firstName} {searchResult.profile.lastName}</p>
                  <p className="text-sm text-muted" dir="ltr">{searchResult.profile.email}</p>
                  <div className="mt-2">
                    {searchResult.profile.role === 'admin' ? (
                      <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-md">مشرف (Admin)</span>
                    ) : (
                      <span className="px-2 py-1 bg-border text-text text-xs font-bold rounded-md">مستخدم عادي</span>
                    )}
                  </div>
                </div>
                <div>
                  {searchResult.profile.role === 'admin' ? (
                    <button
                      onClick={() => handleRoleChange(searchResult.id, 'user', searchResult.profile.email || '')}
                      className="px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-md hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                      <UserX className="h-4 w-4" /> إزالة الصلاحية
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(searchResult.id, 'admin', searchResult.profile.email || '')}
                      className="px-4 py-2 bg-accent text-primary font-bold rounded-md hover:bg-accent-light transition-colors flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" /> ترقية لمشرف
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Admins List */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">المشرفون الحاليون</h2>
            <button onClick={fetchAdmins} className="p-2 text-muted hover:text-accent transition-colors">
              <RefreshCw className={`h-5 w-5 ${loadingAdmins ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {loadingAdmins ? (
              <p className="text-muted text-center py-4">جاري تحميل المشرفين...</p>
            ) : admins.length === 0 ? (
              <p className="text-muted text-center py-4">لا يوجد مشرفين حالياً.</p>
            ) : (
              admins.map(admin => (
                <div key={admin.id} className="p-3 border border-border rounded-lg bg-background flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-text">{admin.profile.firstName} {admin.profile.lastName}</p>
                    <p className="text-xs text-muted" dir="ltr">{admin.profile.email}</p>
                  </div>
                  {user?.uid !== admin.id && (
                    <button
                      onClick={() => handleRoleChange(admin.id, 'user', admin.profile.email || '')}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                      title="إزالة الصلاحية"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
