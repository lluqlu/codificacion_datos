import type { SymbolFrequency, SymbolCode } from "../../types/compression";

interface SymbolCodeTableProps {
  frequencies: SymbolFrequency[];
  huffmanCodes: SymbolCode[];
  shannonFanoCodes: SymbolCode[];
}

export default function SymbolCodeTable({ frequencies, huffmanCodes, shannonFanoCodes }: SymbolCodeTableProps) {
  const hMap  = Object.fromEntries(huffmanCodes.map((c) => [c.symbol, c]));
  const sfMap = Object.fromEntries(shannonFanoCodes.map((c) => [c.symbol, c]));
  const total = frequencies.reduce((s, f) => s + f.frequency, 0);

  return (
    <div className="overflow-auto h-full -m-1">
      <table className="w-full text-[12px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 bg-white text-left px-3 py-2 font-medium" style={{ color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>Simb.</th>
            <th className="sticky top-0 bg-white text-right px-3 py-2 font-medium" style={{ color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>Frec.</th>
            <th className="sticky top-0 bg-white text-right px-2 py-2 font-medium" style={{ color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>%</th>
            <th className="sticky top-0 bg-white text-left px-3 py-2 font-semibold" style={{ color: "#2563eb", borderBottom: "1px solid #f3f4f6" }}>H</th>
            <th className="sticky top-0 bg-white text-left px-3 py-2 font-semibold" style={{ color: "#7c3aed", borderBottom: "1px solid #f3f4f6" }}>SF</th>
          </tr>
        </thead>
        <tbody>
          {frequencies.map((item, idx) => {
            const h  = hMap[item.symbol];
            const sf = sfMap[item.symbol];
            const pct = ((item.frequency / total) * 100).toFixed(1);
            return (
              <tr
                key={item.symbol}
                className="transition-colors"
                style={{ background: idx % 2 === 0 ? "#ffffff" : "#fafafa" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "#ffffff" : "#fafafa"; }}
              >
                <td className="px-3 py-1.5 font-mono font-semibold" style={{ color: "#374151", borderBottom: "1px solid #f9fafb" }}>
                  {item.symbol === " " ? <span style={{ color: "#d1d5db", fontSize: 11 }}>esp.</span> : item.symbol}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums" style={{ color: "#6b7280", borderBottom: "1px solid #f9fafb" }}>{item.frequency}</td>
                <td className="px-2 py-1.5 text-right tabular-nums" style={{ color: "#9ca3af", borderBottom: "1px solid #f9fafb" }}>{pct}%</td>
                <td className="px-3 py-1.5 font-mono tracking-wider" style={{ color: "#2563eb", borderBottom: "1px solid #f9fafb" }}>{h?.code ?? "—"}</td>
                <td className="px-3 py-1.5 font-mono tracking-wider" style={{ color: "#7c3aed", borderBottom: "1px solid #f9fafb" }}>{sf?.code ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
