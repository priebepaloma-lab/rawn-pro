// app/layout.js
import "./globals.css";

export const metadata = {
  title: "RAWN PRO — Alta Performance Fitness Pro",
  description:
    "Coach digital de alta performance com foco em consciência, segurança e presença.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="rp-body">
        {/* HEADER */}
        <header className="rp-header">
          <img
            src="/assets/logo.png"
            alt="RAWN PRO"
            className="rp-logo"
            draggable="false"
          />
          <h1 className="rp-subtitle">Alta Performance Fitness Pro</h1>
        </header>

        {/* MAIN */}
        <main className="rp-shell">{children}</main>

        {/* FOOTER (único, não repete) */}
        <footer className="rp-footer">
          RAWN PRO © 2025 — Consciência, Segurança e Performance.
        </footer>
      </body>
    </html>
  );
}
