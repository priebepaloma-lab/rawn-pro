// RAWN PRO — Memória de Contexto Simplificada
export function buildMemory(messages) {
  // Mantém as últimas 6 mensagens (3 usuário + 3 assistente)
  const context = messages.slice(-6);
  return context.map((m) => ({
    role: m.role,
    content: m.content?.toString().slice(0, 800),
  }));
}
