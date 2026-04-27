"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <Container>
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/qotton_logo.png" alt="قطن" width={100} height={40} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-muted text-lg max-w-sm mb-6">
              خيطٌ يَنسجُ لأثرٍ يَبقى. هوديات مصنوعة بعناية لتُرافقك في كل لحظة، تجمع بين الأصالة والفخامة.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading text-xl text-text font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted hover:text-accent transition-colors">الرئيسية</Link></li>
              <li><Link href="/products" className="text-muted hover:text-accent transition-colors">المنتجات</Link></li>
              <li><Link href="/about" className="text-muted hover:text-accent transition-colors">عن قطن</Link></li>
              <li><Link href="/faq" className="text-muted hover:text-accent transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/contact" className="text-muted hover:text-accent transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-xl text-text font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li><a href="https://www.instagram.com/qottonjo/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">انستقرام</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61584455722091" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">فيسبوك</a></li>
              <li><a href="https://wa.me/qr/ROGVEF7USBOCJ1" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">واتساب</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 py-6 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} قطن. جميع الحقوق محفوظة.</p>
        </div>
      </Container>
    </footer>
  );
}
