import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ChurchConnect - Plateforme Numérique d'Église",
    template: "%s | ChurchConnect",
  },
  description:
    "ChurchConnect est une plateforme numérique complète pour la gestion de votre église. Gérez les membres, les événements, les dons, les groupes de vie et bien plus encore avec élégance et efficacité.",
  keywords: [
    "église",
    "gestion d'église",
    "plateforme église",
    "membres église",
    "dons en ligne",
    "groupes de vie",
    "culte en direct",
    "ChurchConnect",
  ],
  authors: [{ name: "ChurchConnect" }],
  creator: "ChurchConnect",
  publisher: "ChurchConnect",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChurchConnect",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ChurchConnect",
    "application-name": "ChurchConnect",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://churchconnect.app",
    siteName: "ChurchConnect",
    title: "ChurchConnect - Plateforme Numérique d'Église",
    description:
      "La solution complète pour gérer et développer la vie de votre communauté ecclésiale.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChurchConnect - Plateforme Numérique d'Église",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChurchConnect - Plateforme Numérique d'Église",
    description:
      "La solution complète pour gérer et développer la vie de votre communauté ecclésiale.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ServiceWorkerRegistration />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
