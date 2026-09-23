import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { MissionStatus, StepStatus } from "@/db/schema";
import { MISSION_STATUS_LABELS, STEP_STATUS_LABELS } from "@/server/missions/status";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast hover:bg-accent-strong font-semibold",
  secondary: "bg-surface-2 text-fg border border-line-strong hover:border-accent/60",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

export function Button({ variant = "secondary", className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

export function LinkButton({ variant = "secondary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(base, variants[variant], className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-2xl border border-line bg-surface/70 p-5", className)} {...props} />;
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-sm font-semibold uppercase tracking-wide text-muted">
        {children}
      </h2>
      {action}
    </div>
  );
}

const missionTone: Record<MissionStatus, string> = {
  DRAFT: "text-faint border-line-strong",
  NEEDS_INPUT: "text-warning border-warning/40 bg-warning/5",
  PLANNED: "text-info border-info/40 bg-info/5",
  IN_PROGRESS: "text-accent border-accent/50 bg-accent/10",
  WAITING_FOR_USER: "text-warning border-warning/40 bg-warning/5",
  BLOCKED: "text-danger border-danger/40 bg-danger/5",
  PARTIALLY_COMPLETED: "text-violet border-violet/40 bg-violet/5",
  COMPLETED: "text-success border-success/40 bg-success/5",
  FAILED: "text-danger border-danger/40 bg-danger/5",
};

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      data-testid="mission-status"
      data-status={status}
      className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", missionTone[status])}
    >
      {status === "IN_PROGRESS" && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-atlas-pulse" aria-hidden />}
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}

const stepTone: Record<StepStatus, string> = {
  PENDING: "text-faint",
  IN_PROGRESS: "text-accent",
  DONE: "text-success",
  WAITING_USER: "text-warning",
  BLOCKED: "text-danger",
  FAILED: "text-danger",
  SKIPPED: "text-faint line-through",
};

export function StepStatusText({ status }: { status: StepStatus }) {
  return <span className={cx("text-xs font-medium", stepTone[status])}>{STEP_STATUS_LABELS[status]}</span>;
}

export function Alert({ tone = "info", title, children }: { tone?: "info" | "warning" | "danger" | "success"; title?: string; children: ReactNode }) {
  const tones = {
    info: "border-info/30 bg-info/5",
    warning: "border-warning/40 bg-warning/5",
    danger: "border-danger/40 bg-danger/5",
    success: "border-success/40 bg-success/5",
  };
  const titleTone = { info: "text-info", warning: "text-warning", danger: "text-danger", success: "text-success" };
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {title && <p className={cx("mb-1 font-semibold", titleTone[tone])}>{title}</p>}
      <div className="text-fg/90">{children}</div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-5 py-8 text-center">
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <path d="M2 12h20M12 2c3 3.2 3 16.8 0 20M12 2c-3 3.2-3 16.8 0 20" fill="none" stroke="var(--accent)" strokeWidth="1.2" opacity=".7" />
      </svg>
      Atlas
    </span>
  );
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
