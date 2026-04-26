"use client";

import { useEffect, useState } from "react";
import { getMessages } from "@/lib/messages";
import type { ContactMessage } from "@/types";
import { Mail, Calendar, User, Search, Trash2, MessageSquare } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<(ContactMessage & { id: string; createdAt?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, messageId: string | null, messageName: string | null, messageEmail: string | null}>({ isOpen: false, messageId: null, messageName: null, messageEmail: null });

  const confirmDelete = async () => {
    const { messageId, messageName, messageEmail } = deleteModalState;
    if (!messageId) return;

    try {
      const { deleteMessage } = await import("@/lib/messages");
      const { logActivity } = await import("@/lib/logger");
      const { auth } = await import("@/lib/firebase");
      await deleteMessage(messageId);
      
      if (auth.currentUser) {
        await logActivity(
          auth.currentUser.uid,
          auth.currentUser.displayName || "مدير",
          auth.currentUser.email || "",
          "DELETE",
          `تم حذف رسالة من ${messageName} (${messageEmail})`
        );
      }
      
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الرسالة");
    } finally {
      setDeleteModalState({ isOpen: false, messageId: null, messageName: null, messageEmail: null });
    }
  };

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages();
        setMessages(data);
        
        const unread = data.filter(m => m.isRead === false || m.isRead === undefined);
        if (unread.length > 0) {
          const { markMessageAsRead } = await import("@/lib/messages");
          unread.forEach(m => markMessageAsRead(m.id));
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      msg.name.toLowerCase().includes(term) ||
      msg.email.toLowerCase().includes(term) ||
      (msg.phone && msg.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">استفسارات العملاء</h1>
          <p className="text-muted">عرض رسائل تواصل العملاء من صفحة اتصل بنا</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث (اسم، بريد، هاتف)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMessages.map(msg => (
            <div key={msg.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-accent/30 transition-colors flex flex-col h-full relative">
              {(!msg.isRead) && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="رسالة جديدة"></div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{msg.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${msg.email}`} className="hover:text-accent font-mono transition-colors" dir="ltr">{msg.email}</a>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {msg.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-muted whitespace-nowrap bg-background px-2 py-1 border border-border rounded">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(msg.createdAt.toMillis()).toLocaleDateString('ar-JO')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setDeleteModalState({ isOpen: true, messageId: msg.id, messageName: msg.name, messageEmail: msg.email });
                    }}
                    className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded transition-all"
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-background border border-border rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-accent font-bold">
                    <span className="text-sm">رقم الهاتف:</span>
                    <span dir="ltr" className="font-mono">{msg.phone || 'غير متوفر'}</span>
                  </div>
                  {msg.phone && (
                    <a 
                      href={`https://wa.me/${msg.phone.replace(/^0/, "962")}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-bold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      واتساب
                    </a>
                  )}
                </div>
                <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center p-12 bg-surface border border-border rounded-xl">
              <Mail className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">لا يوجد رسائل</h3>
              <p className="text-muted">لم يتم العثور على أي رسائل مطابقة للبحث أو أن صندوق الوارد فارغ.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="حذف الرسالة"
        message="هل أنت متأكد من حذف هذه الرسالة بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف نهائياً"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, messageId: null, messageName: null, messageEmail: null })}
      />
    </div>
  );
}
