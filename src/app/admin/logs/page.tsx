"use client";

import { useState, useEffect } from "react";
import { getRecentActivityLogs, clearAllActivityLogs, ActivityLog } from "@/lib/logger";
import { Activity, Clock, RefreshCw, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const recentLogs = await getRecentActivityLogs();
    setLogs(recentLogs);
    setLoading(false);
  };

  const handleClearLogs = async () => {
    try {
      setLoading(true);
      await clearAllActivityLogs();
      await fetchLogs();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تفريغ السجل.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'LOGIN': return 'bg-accent/10 text-accent border-accent/20';
      case 'LOGOUT': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return 'إضافة';
      case 'UPDATE': return 'تعديل';
      case 'DELETE': return 'حذف';
      case 'LOGIN': return 'تسجيل دخول';
      case 'LOGOUT': return 'تسجيل خروج';
      default: return 'أخرى';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl text-accent">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-text">سجل النشاطات</h1>
            <p className="text-muted">متابعة كافة حركات وتعديلات المشرفين</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchLogs}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث السجل
          </button>
          {logs.length > 0 && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              تفريغ السجل
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-background text-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold">المشرف</th>
                <th className="px-6 py-4 font-bold">نوع الحركة</th>
                <th className="px-6 py-4 font-bold">التفاصيل</th>
                <th className="px-6 py-4 font-bold">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    جاري تحميل سجل النشاطات...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    لا يوجد أي نشاطات مسجلة حتى الآن.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-text">{log.adminName}</p>
                      <p className="text-xs text-muted" dir="ltr">{log.adminEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text w-1/2">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span dir="ltr">{formatDate(log.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="تفريغ سجل النشاطات"
        message="هل أنت متأكد من مسح جميع النشاطات من السجل؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="تفريغ السجل"
        onConfirm={handleClearLogs}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
