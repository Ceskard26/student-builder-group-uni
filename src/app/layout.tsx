import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Fuentes oficiales del brand kit de AWS Student Builder Group.
const emberDisplay = localFont({
  src: [
    { path: "./fonts/AmazonEmberDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/AmazonEmberDisplay-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/AmazonEmberDisplay-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/AmazonEmberDisplay-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/AmazonEmberDisplay-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-ember-display",
  display: "swap",
});

const emberMono = localFont({
  src: [
    { path: "./fonts/AmazonEmberMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/AmazonEmberMono-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ember-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: "AWS Student Builder Group UNI",
  description:
    "AWS Student Builder Group de la Universidad Nacional de Ingeniería (UNI), Lima, Perú.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${emberDisplay.variable} ${emberMono.variable} font-sans min-h-screen flex flex-col bg-bg`}
      >
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
