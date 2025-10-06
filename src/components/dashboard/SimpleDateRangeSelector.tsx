/**
 * Simple Date Range Selector
 * 
 * Provides quick preset options for common date ranges
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export type DateRangePreset = "last3days" | "last7days" | "last30days" | "last3months";

interface SimpleDateRangeSelectorProps {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
}

const PRESETS: Record<DateRangePreset, string> = {
  last3days: "Last 3 days",
  last7days: "Last 7 days",
  last30days: "Last 30 days",
  last3months: "Last 3 months",
};

export function SimpleDateRangeSelector({ value, onChange }: SimpleDateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PRESETS) as DateRangePreset[]).map((preset) => (
            <SelectItem key={preset} value={preset}>
              {PRESETS[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getDateRangeFromPreset(preset: DateRangePreset): [string, string] {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  
  let daysBack: number;
  switch (preset) {
    case "last3days":
      daysBack = 3;
      break;
    case "last7days":
      daysBack = 7;
      break;
    case "last30days":
      daysBack = 30;
      break;
    case "last3months":
      daysBack = 90;
      break;
    default:
      daysBack = 7;
  }
  
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);
  const startStr = start.toISOString().split("T")[0];
  
  return [startStr, end];
}
