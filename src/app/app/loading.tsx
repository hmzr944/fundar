import { Spinner } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex items-center gap-3 py-16 text-muted" role="status">
      <Spinner className="text-accent" /> Chargement…
    </div>
  );
}
