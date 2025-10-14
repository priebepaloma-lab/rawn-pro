// app/layout.client.js — RAWN PRO — Splash + iOS Keyboard Fix + SW + Layout
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LayoutClient({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  // Corrige altura real do app quando o teclado abre (iOS) usando visualViewport
  useEffect(() => {
    const setAppHeight = () => {
      const h = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${h}px`);
    };
    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);
    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);

  // Splash: 1 ciclo do "breathe" (~4.5s) + fade-out suave
  useEffect(() => {
    const t = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 4400 + 900);
    return () => clearTimeout(t);
  }, []);

  // Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then(() => console.log("RAWN PRO Service Worker ativo"))
          .catch((err) => console.error("Erro ao registrar Service Worker:", err));
      };
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return (
    <>
      {showSplash && (
        <div className="rp-splash">
          <Image
            src="/assets/logo.png"
            alt="RAWN PRO"
            className="rp-splash-logo"
            width={128}
            height={128}
            priority
          />
        </div>
      )}

      <main className={`rp-root ${fadeIn ? "rp-fade-in" : ""}`} id="app-root">
        {/* Header global */}
        <header className="rp-header">
          <Image
            src="/assets/logo.png"
            alt="RAWN PRO"
            className="rp-logo"
            width={72}
            height={72}
            priority
          />
          <h2 className="rp-subtitle">Alta Performance Fitness Pro</h2>
        </header>

        {/* Conteúdo principal */}
        <div className="rp-shell">{children}</div>

        {/* Rodapé */}
        <footer className="rp-footer">
          © {new Date().getFullYear()} RAWN PRO — Alta Performance Fitness Pro
        </footer>
      </main>
      <div className="rp-keyboard-overlay" />
    </>
  );
}

