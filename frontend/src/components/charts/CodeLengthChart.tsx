import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SymbolCode } from "../../types/compression";

interface CodeLengthChartProps {
  huffmanCodes: SymbolCode[];
  shannonFanoCodes: SymbolCode[];
}

export default function CodeLengthChart({ huffmanCodes, shannonFanoCodes }: CodeLengthChartProps) {
  const sfMap = Object.fromEntries(shannonFanoCodes.map((c) => [c.symbol, c.length]));

  const data = huffmanCodes.map((hc) => ({
    name: hc.symbol === " " ? "esp" : hc.symbol,
    Huffman: hc.length,
    "Shannon-Fano": sfMap[hc.symbol] ?? 0,
  }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "monospace" }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Huffman" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Shannon-Fano" fill="#7c3aed" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
