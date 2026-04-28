import { cn } from "@/lib/utils";
import type { Branch } from "@/lib/mockData";

const map: Record<Branch, { label: string; cls: string }> = {
  ich: { label: "ICH", cls: "badge-ich" },
  wl:  { label: "WL",  cls: "badge-wl" },
  tm:  { label: "TM",  cls: "badge-tm" },
};

export function BranchBadge({ branch, className }: { branch: Branch; className?: string }) {
  const { label, cls } = map[branch];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold", cls, className)}>
      {label}
    </span>
  );
}

export function StatusBadge({ status, tone = "default" }: { status: string; tone?: "default" | "success" | "warning" | "info" | "danger" }) {
  const tones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/15 text-info",
    danger: "bg-destructive/15 text-destructive",
  };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium", tones[tone])}>{status}</span>;
}
