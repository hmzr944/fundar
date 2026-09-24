import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { createStorageHealthCheck } from "@/server/documents/health";
import { resolveStorageDir } from "@/server/documents/storage";

// Separate from /api/health (application up): this one proves the storage volume is usable.
let check: ReturnType<typeof createStorageHealthCheck> | undefined;

export async function GET() {
  check ??= createStorageHealthCheck(getDb(), resolveStorageDir());
  const health = await check();
  return NextResponse.json(health, { status: health.ok ? 200 : 503 });
}
