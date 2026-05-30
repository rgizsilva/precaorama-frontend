import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/mock-data";
import { formatPrice } from "@/lib/mock-data";

export function PriceChart({
  data,
  height = 280,
  compact = false,
}: {
  data: PricePoint[];
  height?: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {!compact && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
        {!compact && (
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
        )}
        {!compact && (
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatPrice(v as number)}
            width={64}
          />
        )}
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-muted-foreground)" }}
          formatter={(v: number) => [formatPrice(v), "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--color-gold)"
          strokeWidth={2}
          fill="url(#g1)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
