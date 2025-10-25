"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-6 p-8">
        <Image
          src="/logo.png"
          alt="RAWN Pro Logo"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-3xl font-semibold tracking-tight">RAWN Pro</h1>
        <p className="text-gray-400 text-center max-w-md">
          Plataforma de IA estratégica para negócios e marcas.  
          Conecte, analise e decida com precisão.
        </p>
        <input
          type="text"
          placeholder="Digite uma mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-4 w-72 p-2 rounded-md text-black"
        />
      </div>
    </main>
  );
}
