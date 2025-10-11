// app/layout.js — RAWN PRO • Head (PWA) + color-scheme meta + wrapper
import "./globals.css";
import LayoutClient from "./layout.client";

export const metadata = {
  title: "RAWN PRO — Alta Performance Fitness Pro",
  description:
    "Assistente de alta performance com IA — treinos, constância emocional e performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon-64.png" sizes="64x64" type="image/png" />
        <meta name="theme-color" content="#00ffa3" />

        {/* iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="RAWN PRO" />
        <link rel="apple-touch-icon" href="/icon-512.png" />

        {/* 👉 força os controles nativos (incl. barra acima do teclado) a usarem tema escuro */}
        <meta name="color-scheme" content="dark" />
      </head>

      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
