import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SymbolFrequency } from "../../types/compression";

interface FrequencyChartProps {
  frequencies: SymbolFrequency[];
}

export default function FrequencyChart({ frequencies }: FrequencyChartProps) {
  const data = frequencies.map((f) => ({
    name: f.symbol === " " ? "esp" : f.symbol,
    value: f.frequency,
  }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "monospace" }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
            formatter={(v) => [v, "frecuencia"]}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#3b82f6" fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
