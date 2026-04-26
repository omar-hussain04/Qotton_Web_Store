"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { NAV_LINKS } from "@/lib/constants";
import { usePathname } from "next/navigation";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const { user } = useAuth();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const pathname = usePathname();
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <Container>
          <div className="flex h-16 md:h-24 items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden text-text hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">القائمة</span>
              </button>
              <Link href="/" className="flex items-center gap-2 relative group">
                <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image src="/qotton_logo.png" alt="قطن" width={120} height={64} className="h-9 md:h-16 w-auto object-contain relative z-10" />
              </Link>
            </div>

            <nav className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-10">
              {NAV_LINKS.filter(link => ["/", "/products", "/about", "/faq", "/contact"].includes(link.href)).map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-text hover:text-accent transition-colors font-bold text-base tracking-wide relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all after:duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 md:gap-6">
              <Link href="/wishlist" className="hidden sm:block text-text hover:text-accent transition-colors relative">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center font-numbers">
                    {wishlistCount}
                  </span>
                )}
                <span className="sr-only">المفضلة</span>
              </Link>
              <button 
                className="text-text hover:text-accent transition-colors relative"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-primary flex items-center justify-center font-numbers">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">السلة</span>
              </button>
              <Link href="/account" className="flex items-center justify-center text-text hover:text-accent transition-colors">
                {mounted && user ? (
                  user.photoURL ? (
                    <Image src={user.photoURL} alt={user.displayName || "حسابي"} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-border" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {user.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </div>
                  )
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">حسابي</span>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 z-[110] h-full w-[280px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Close Button & Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <Image src="/qotton_logo.png" alt="قطن" width={80} height={40} className="h-8 w-auto object-contain" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-muted hover:text-accent transition-colors rounded-full hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-text hover:text-accent hover:bg-surface/50 transition-all font-bold text-lg border-b border-border/20"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social / Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-surface/30">
          <p className="text-center text-sm text-muted">خيطٌ يَنسجُ لأثرٍ يَبقى</p>
        </div>
      </div>
    </>
  );
}
