import { NextResponse } from "next/server";
import { parseJson, requireUser, route } from "@/lib/http";
import { startAnalysis } from "@/server/agent/runner";
import { getAgentDeps } from "@/server/deps";
import { AppError, conflict } from "@/server/errors";
import { addMessage, getOwnedMission, hasActiveRun, messageSchema } from "@/server/missions/service";

type Ctx = { params: Promise<{ id: string }> };

/** Adds information to a mission, then re-analyses it (plan update, new questions). */
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { content } = await parseJson(req, messageSchema);
  const deps = getAgentDeps();
  await getOwnedMission(deps.db, user.id, id);
  if (await hasActiveRun(deps.db, id)) {
    throw conflict("Atlas travaille sur cette mission. Attendez la fin ou interrompez l'exécution pour ajouter une information.");
  }
  await addMessage(deps.db, id, "user", content);
  let notice: string | null = null;
  try {
    await startAnalysis(deps, user.id, id);
  } catch (e) {
    if (!(e instanceof AppError)) throw e;
    notice = e.message;
  }
  return NextResponse.json({ ok: true, notice }, { status: 201 });
});
