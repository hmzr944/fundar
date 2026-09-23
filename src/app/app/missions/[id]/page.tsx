import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/workspace";
import { requirePageUser } from "@/lib/http";
import type { MissionDetailDTO } from "@/lib/client/types";
import { AppError } from "@/server/errors";
import { loadMissionPayload } from "@/server/missions/payload";

export const metadata: Metadata = { title: "Mission" };

export default async function MissionPage({ params }: PageProps<"/app/missions/[id]">) {
  const user = await requirePageUser();
  const { id } = await params;
  let payload;
  try {
    payload = await loadMissionPayload(user.id, id);
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    throw e;
  }
  // Same JSON shape as the polling API.
  const initial = JSON.parse(JSON.stringify(payload)) as MissionDetailDTO;
  return <MissionWorkspace key={id} initial={initial} />;
}
