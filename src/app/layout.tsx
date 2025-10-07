import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider } from "@/components/providers/I18nProvider";

export const metadata: Metadata = {
  title: "Monifly - Умное управление финансами",
  description:
    "Возьмите под контроль свои финансы с Monifly. Отслеживайте расходы, управляйте кошельками и получайте советы по бюджетированию на базе ИИ.",
};

export const viewport = {
  themeColor: "#00B3B3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased">
        <I18nProvider>
          {children}
          <Toaster />
          <SpeedInsights />
        </I18nProvider>
      </body>
    </html>
  );
}
