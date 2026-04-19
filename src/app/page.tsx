import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/db";

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="relative w-full">
      {/* ... Hero Section ... */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary">
          <Image
            src="/product/main.png"
            alt="Qotton Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_50%] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        </div>

        <Container className="relative z-10 text-center pt-[55vh] md:pt-[65vh] pb-16 flex flex-col items-center">
          <h1 className="sr-only">قطن Qotton - متجر هوديات وملابس أردنية أصلية</h1>
          <h2 className="text-2xl md:text-3xl font-heading text-accent mb-2 drop-shadow-sm">خيطٌ يَنسجُ لأثرٍ يَبقى</h2>
          <p className="text-xl md:text-2xl text-text max-w-2xl mx-auto opacity-90 mb-8 leading-relaxed font-light">
            هوديات بملمس الفخامة وتفاصيل الأصالة الأردنية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 max-w-sm sm:max-w-none">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-transform duration-300">
                اكتشف المجموعة
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg px-8 py-6 rounded-full font-bold bg-background/50 backdrop-blur-md hover:bg-background border-2 shadow-lg hover:scale-105 transition-transform duration-300">
                تسوّق الآن
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Collection */}
      <section className="py-24 bg-background">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-accent tracking-wider text-sm font-medium mb-2 block">المجموعة الأحدث</span>
              <h2 className="font-heading text-4xl md:text-5xl text-text">تألق بأصالة</h2>
            </div>
            <Link href="/products" className="hidden sm:inline-flex text-accent hover:text-accent-light font-medium transition-colors">
              عرض الكل &larr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted">جاري تحميل المنتجات...</div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="w-full block">
              <Button variant="outline" className="w-full py-6 rounded-xl font-bold">عرض الكل</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-5xl text-accent mb-8">نسج من الأصالة</h2>
            <p className="text-lg md:text-xl text-text/90 leading-relaxed mb-8">
              في قطن، نؤمن أن الملبس ليس مجرد قماش، بل قصة تُحكى في كل خيط. نحن نجمع بين التراث العربي العريق والتصميم العصري المريح لنقدم لك هوديات تعكس هويتك وترافقك في كل لحظاتك.
            </p>
            <div className="w-24 h-px bg-border mx-auto" />
          </div>
        </Container>
      </section>
    </div>
  );
}
