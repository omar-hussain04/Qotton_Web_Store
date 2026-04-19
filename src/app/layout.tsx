import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { WishlistSync } from "@/components/auth/WishlistSync";
import { CartSync } from "@/components/auth/CartSync";
import Script from "next/script";

const lyonArabic = localFont({
  src: [
    {
      path: '../../public/fonts/COMM - Lyon Arabic Display Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/COMM - Lyon Arabic Display Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/COMM - Lyon Arabic Display Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/COMM - Lyon Arabic Display Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/COMM - Lyon Arabic Display Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-lyon',
  display: 'swap',
});

const tsHikayat = localFont({
  src: '../../public/fonts/TSHikayatVF.otf',
  variable: '--font-hikayat',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://qotton.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "قطن | Qotton — متجر هوديات وملابس أردنية مصنوعة بعناية",
    template: "%s | قطن Qotton",
  },
  description: "متجر قطن الأردني — هوديات وملابس مصنوعة بعناية من أجود أنواع القطن. تصاميم عصرية بجودة لا تُضاهى. خيطٌ يَنسجُ لأثرٍ يَبقى. توصيل لجميع محافظات الأردن.",
  keywords: [
    "قطن", "Qotton", "هوديات", "هودي", "ملابس", "متجر أردني", "ملابس أردنية",
    "أزياء", "موضة", "hoodies", "streetwear", "Jordan", "clothing",
    "تسوق أونلاين", "ملابس رجالية", "ملابس نسائية", "قطن أردني",
    "متجر إلكتروني", "توصيل الأردن", "عمان", "ملابس شتوية",
  ],
  authors: [{ name: "Qotton", url: SITE_URL }],
  creator: "Qotton",
  publisher: "Qotton",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: SITE_URL,
    siteName: "قطن | Qotton",
    title: "قطن | Qotton — هوديات وملابس أردنية مصنوعة بعناية",
    description: "خيطٌ يَنسجُ لأثرٍ يَبقى — هوديات وملابس مصنوعة من أجود أنواع القطن بتصاميم عصرية. توصيل لجميع محافظات الأردن.",
    images: [
      {
        url: `${SITE_URL}/qotton_logo.png`,
        width: 1200,
        height: 630,
        alt: "قطن Qotton - متجر هوديات وملابس أردنية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "قطن | Qotton — هوديات وملابس أردنية",
    description: "خيطٌ يَنسجُ لأثرٍ يَبقى — هوديات وملابس مصنوعة من أجود أنواع القطن",
    images: [`${SITE_URL}/qotton_logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add Google Search Console verification code here later
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "قطن | Qotton",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/qotton_logo.png`,
      },
      description: "متجر هوديات وملابس أردنية مصنوعة بعناية من أجود أنواع القطن",
      address: {
        "@type": "PostalAddress",
        addressCountry: "JO",
        addressLocality: "عمان",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "قطن | Qotton",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "ar",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/products?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tsHikayat.variable} ${lyonArabic.variable} ${cormorant.variable} antialiased selection:bg-accent selection:text-primary`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col font-body">
        <AuthProvider>
          <WishlistSync />
          <CartSync />
          <Header />
          <main className="flex-1 shrink-0 bg-background relative z-0">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}

