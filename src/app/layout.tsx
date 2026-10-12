import type { Metadata } from "next";
import { Manrope, Montserrat, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import { AuthProvider } from "@/lib/AuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Socrates: Project-First AI Tutor for Learning AI",
  description:
    "Tell it your project goal. Socrates teaches exactly the AI concepts you need, right when you need it, with typed error diagnosis and live execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

