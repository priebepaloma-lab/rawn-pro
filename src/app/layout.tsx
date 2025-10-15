import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAWN PRO — Human Performance Advisor",
  description:
    "RAWN PRO é um conselheiro de performance humana com precisão científica e empatia real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#F8F9FA] text-[#1E1E1E]`}>
        {children}
      </body>
    </html>
  );
}
