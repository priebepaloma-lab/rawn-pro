// /app/lib/memory-engine.js
// RAWN PRO - Memory Engine Supreme Edition 🧠
// Inteligência contextual com segurança jurídica e empatia de coach

const memoryStore = new Map();

export function getMemory(sessionId = "default-session") {
  if (!memoryStore.has(sessionId)) {
    memoryStore.set(sessionId, {
      userProfile: {
        gender: null,
        age: null,
        level: null,
        limitations: null,
        equipment: null,
        time: null,
        emotional: null,
      },
      goals: [],
      warnings: [],
      lastTopics: [],
    });
  }
  return memoryStore.get(sessionId);
}

export function updateMemory(sessionId, userMessage) {
  const memory = getMemory(sessionId);
  const lower = userMessage.toLowerCase();

  // ==============================
  // 🧍 GÊNERO
  // ==============================
  if (lower.includes("homem") || lower.includes("masculino")) {
    memory.userProfile.gender = "male";
  } else if (lower.includes("mulher") || lower.includes("feminino")) {
    memory.userProfile.gender = "female";
  }

  // ==============================
  // 🎂 IDADE
  // ==============================
  const ageMatch = lower.match(/\b(\d{2})\s*(anos|years)/);
  if (ageMatch) {
    memory.userProfile.age = parseInt(ageMatch[1]);
  }

  // ==============================
  // 💪 NÍVEL DE CONDICIONAMENTO
  // ==============================
  if (lower.includes("iniciante") || lower.includes("começando")) {
    memory.userProfile.level = "beginner";
  } else if (lower.includes("intermediário")) {
    memory.userProfile.level = "intermediate";
  } else if (lower.includes("avançado")) {
    memory.userProfile.level = "advanced";
  }

  // ==============================
  // 🎯 OBJETIVOS / METAS
  // ==============================
  if (lower.includes("força")) memory.goals.push("força");
  if (lower.includes("hipertrofia") || lower.includes("músculo") || lower.includes("pump"))
    memory.goals.push("hipertrofia muscular");
  if (lower.includes("emagrecer") || lower.includes("perder peso"))
    memory.goals.push("emagrecimento");
  if (lower.includes("mobilidade")) memory.goals.push("mobilidade");
  if (lower.includes("alongamento") || lower.includes("flexibilidade"))
    memory.goals.push("flexibilidade");
  if (lower.includes("foco") || lower.includes("mente")) memory.goals.push("foco mental");
  if (lower.includes("cardio") || lower.includes("resistência"))
    memory.goals.push("resistência cardiovascular");

  // ==============================
  // ⚠️ LIMITAÇÕES OU DORES
  // ==============================
  if (lower.includes("dor") || lower.includes("lesão") || lower.includes("cirurgia")) {
    memory.userProfile.limitations = "reported issue";
    memory.warnings.push("User mentioned pain or injury — medical attention recommended.");
  } else if (lower.includes("sem dor") || lower.includes("zero dor")) {
    memory.userProfile.limitations = "none";
  }

  // ==============================
  // 🏋️‍♂️ EQUIPAMENTOS
  // ==============================
  if (lower.includes("academia") || lower.includes("gym") || lower.includes("halter")) {
    memory.userProfile.equipment = "gym";
  } else if (lower.includes("elástico") || lower.includes("faixa")) {
    memory.userProfile.equipment = "bands";
  } else if (lower.includes("casa") || lower.includes("sem equipamento")) {
    memory.userProfile.equipment = "bodyweight";
  }

  // ==============================
  // ⏱️ TEMPO DISPONÍVEL
  // ==============================
  const timeMatch = lower.match(/(\d+)\s*(min|minutes|minutos)/);
  if (timeMatch) {
    memory.userProfile.time = `${timeMatch[1]} min`;
  }

  // ==============================
  // 😌 ESTADO EMOCIONAL
  // ==============================
  if (
    lower.includes("cansado") ||
    lower.includes("fatigado") ||
    lower.includes("exausto") ||
    lower.includes("desmotivado")
  ) {
    memory.userProfile.emotional = "tired";
  } else if (
    lower.includes("motivado") ||
    lower.includes("animado") ||
    lower.includes("feliz") ||
    lower.includes("empolgado")
  ) {
    memory.userProfile.emotional = "motivated";
  } else if (
    lower.includes("ansioso") ||
    lower.includes("nervoso") ||
    lower.includes("preocupado") ||
    lower.includes("mental")
  ) {
    memory.userProfile.emotional = "anxious";
  }

  // ==============================
  // 📚 CONTEXTO DE TÓPICOS RECENTES
  // ==============================
  memory.lastTopics.push(userMessage);
  if (memory.lastTopics.length > 10) memory.lastTopics.shift();

  // ==============================
  // ⚖️ BLINDAGEM JURÍDICA AUTOMÁTICA
  // ==============================
  if (lower.includes("doença") || lower.includes("pressão") || lower.includes("cardíaco")) {
    memory.warnings.push(
      "User mentioned a medical condition. Ensure response includes legal safety disclaimer."
    );
  }

  if (lower.includes("médico") || lower.includes("diagnóstico")) {
    memory.warnings.push(
      "User referred to medical evaluation. Reinforce that RAWN PRO does not replace professional medical advice."
    );
  }

  // ==============================
  // 🧠 LIMITE DE MEMÓRIA E LIMPEZA
  // ==============================
  memory.goals = [...new Set(memory.goals)].slice(-6); // evita repetição
  memory.warnings = [...new Set(memory.warnings)].slice(-6);

  memoryStore.set(sessionId, memory);
  return memory;
}

