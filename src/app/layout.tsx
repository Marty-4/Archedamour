import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { QueryProvider } from "@/providers/query-provider";

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
    default: "Arche d'Amour - Plateforme d'Église",
    template: "%s | Arche d'Amour",
  },
  description:
    "Arche d'Amour est une plateforme numérique complète pour la gestion de votre église. Gérez les membres, les événements, les dons, les groupes de vie et bien plus encore.",
  keywords: [
    "église",
    "gestion d'église",
    "plateforme église",
    "membres église",
    "dons en ligne",
    "groupes de vie",
    "culte en direct",
    "Arche d'Amour",
  ],
  authors: [{ name: "Arche d'Amour" }],
  creator: "Arche d'Amour",
  publisher: "Arche d'Amour",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/LogoArche.jpg", sizes: "192x192", type: "image/jpg" },
      { url: "/icons/LogoArche.jpg", sizes: "512x512", type: "image/jpg" },
    ],
    apple: [
      { url: "/icons/LogoArche.jpg", sizes: "180x180", type: "image/jpg" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arche d'Amour",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Arche d'Amour",
    "application-name": "Arche d'Amour",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://archedamour.vercel.app",
    siteName: "Arche d'Amour",
    title: "Arche d'Amour - Plateforme d'Église",
    description:
      "La solution complète pour gérer et développer la vie de votre communauté ecclésiale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arche d'Amour - Plateforme d'Église",
    description:
      "La solution complète pour gérer et développer la vie de votre communauté ecclésiale.",
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
          <QueryProvider>
            <ServiceWorkerRegistration />
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
