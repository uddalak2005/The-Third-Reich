import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  iconColor?: string;
  iconBg?: string;
  valueColor?: string;
}

export function StatCard({ title, value, icon: Icon, change, iconColor = "text-sentinel-indigo", iconBg = "bg-sentinel-indigo-light", valueColor = "text-foreground" }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={cn("text-2xl font-bold leading-tight", valueColor)}>{value}</p>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", change >= 0 ? "text-sentinel-green" : "text-sentinel-red")}>
            {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className={cn("p-2.5 rounded-lg", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
    </div>
  );
}
