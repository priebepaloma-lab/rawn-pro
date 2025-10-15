import { NextResponse } from "next/server";
import { resetUserMemory } from "@/server/memory/repository";
import { logEvent } from "@/server/logging";

type ResetPayload = {
  user?: string;
};

export async function POST(request: Request) {
  let payload: ResetPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const user = payload.user?.trim();

  if (!user) {
    return NextResponse.json(
      { error: "Usuario obrigatorio." },
      { status: 400 }
    );
  }

  logEvent("rawn_memory_reset_request", { user });

  await resetUserMemory(user);

  return NextResponse.json({ status: "ok" });
}
