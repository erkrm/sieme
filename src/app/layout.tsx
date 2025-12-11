import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "SIEME - Plataforma de Gestión de Servicios Técnicos Industriales",
  description: "La plataforma definitiva para gestión inteligente de servicios técnicos. Asignación automática, tracking GPS, facturación instantánea y SLA garantizado. Conectamos empresas con técnicos certificados.",
  keywords: [
    "servicios técnicos industriales",
    "mantenimiento industrial",
    "gestión de órdenes de trabajo",
    "tracking GPS técnicos",
    "plataforma SaaS mantenimiento",
    "electrónica industrial",
    "mecánica industrial",
    "electricidad industrial",
    "CMMS",
    "field service management"
  ],
  authors: [{ name: "SIEME Team" }],
  creator: "SIEME",
  publisher: "SIEME",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SIEME - Gestión Inteligente de Servicios Técnicos",
    description: "Plataforma SaaS para conectar empresas con técnicos certificados. Asignación inteligente, tracking GPS y facturación automática.",
    url: "https://sieme.com",
    siteName: "SIEME",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SIEME - Plataforma de Servicios Técnicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIEME - Servicios Técnicos Industriales",
    description: "Plataforma SaaS para gestión inteligente de servicios técnicos. Asignación automática, tracking GPS y facturación instantánea.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://sieme.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
