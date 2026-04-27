"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-border shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold text-text font-heading">{title}</h3>
                  <p className="mt-2 text-muted leading-relaxed">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 text-muted hover:text-text hover:bg-background rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-background px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-bold text-text hover:bg-surface rounded-lg transition-colors border border-border disabled:opacity-50"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDestructive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-accent hover:bg-accent-light"
                }`}
                onClick={() => {
                  onConfirm();
                }}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
