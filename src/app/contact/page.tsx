"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { saveContactMessage } from "@/lib/db";
import { CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    try {
      await saveContactMessage(data);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("عذراً، حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Container className="py-20 flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-surface border border-border/50 p-10 rounded-2xl shadow-xl max-w-lg w-full">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-bold text-text mb-4">تم إرسال رسالتك بنجاح!</h2>
          <p className="text-muted mb-8 text-lg">شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
          <Button onClick={() => setIsSuccess(false)} className="w-full">
            إرسال رسالة أخرى
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20 flex-1">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-text mb-2 text-center">تواصل معنا</h1>
        <p className="text-muted text-center mb-10">نحن هنا للإجابة على جميع استفساراتك وخدمتك بأفضل صورة.</p>
        
        <form onSubmit={handleSubmit} className="bg-surface border border-border/50 rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-text">الاسم الكامل</label>
              <input type="text" name="name" id="name" required className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors" placeholder="أدخل اسمك" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text">البريد الإلكتروني</label>
              <input type="email" name="email" id="email" required className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors" placeholder="example@email.com" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-text">رقم الهاتف</label>
            <input type="tel" name="phone" id="phone" required className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors text-left" placeholder="0790000000" dir="ltr" />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-text">الرسالة</label>
            <textarea id="message" name="message" required rows={5} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors resize-none" placeholder="كيف يمكننا مساعدتك؟" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6" size="lg">
            {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
