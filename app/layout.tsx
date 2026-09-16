import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/app/providers";
import "@/index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NariSetu AI - IIT Indore & Drishti CPS",
  description: "AI-assisted breast healthcare research platform providing explainable clinical decision support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
