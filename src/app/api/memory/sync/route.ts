import { NextResponse } from "next/server";
import { saveMemorySummary } from "@/server/memory/repository";
import { logEvent } from "@/server/logging";

type SyncPayload = {
  user?: string;
  summary?: string | null;
};

export async function POST(request: Request) {
  let payload: SyncPayload;

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

  const summary = typeof payload.summary === "string" ? payload.summary : null;

  logEvent("rawn_memory_sync_request", {
    user,
    summaryLength: summary?.length ?? 0,
  });

  await saveMemorySummary(user, summary ?? null);

  return NextResponse.json({ status: "ok" });
}
