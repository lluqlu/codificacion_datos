import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SymbolFrequency } from "../../types/compression";

interface FrequencyChartProps {
  frequencies: SymbolFrequency[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 text-[12px]"
      style={{
        background: "#1f2937",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        color: "#f9fafb",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ color: "#9ca3af" }}>{label}</span>
      <span className="ml-2 font-semibold">{payload[0].value}</span>
    </div>
  );
}

export default function FrequencyChart({ frequencies }: FrequencyChartProps) {
  const data = frequencies.map((f) => ({
    name: f.symbol === " " ? "esp" : f.symbol,
    value: f.frequency,
  }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barCategoryGap="35%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fontFamily: "Inter, system-ui", fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: "Inter, system-ui", fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#2563eb" fillOpacity={0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
