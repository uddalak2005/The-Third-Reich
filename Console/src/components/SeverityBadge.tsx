import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "info";

const severityStyles: Record<Severity, string> = {
  critical: "bg-[#FEF2F2] text-[#DC2626]",
  high: "bg-[#FFF7ED] text-[#EA580C]",
  medium: "bg-[#FFFBEB] text-[#D97706]",
  low: "bg-[#EFF6FF] text-[#2563EB]",
  info: "bg-[#F9FAFB] text-[#6B7280]",
};

const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", severityStyles[severity], className)}>
      {severityLabels[severity]}
    </span>
  );
}
