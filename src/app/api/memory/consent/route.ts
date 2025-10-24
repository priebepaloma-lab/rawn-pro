import { NextResponse } from "next/server";
import { logEvent } from "@/server/logging";

type ConsentPayload = {
  user?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  let payload: ConsentPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const user = payload.user?.trim() ?? "unknown";

  logEvent("rawn_memory_consent", {
    user,
    consent: Boolean(payload.consent),
    route: "/api/memory/consent",
  });

  return NextResponse.json({ status: "ok" });
}
