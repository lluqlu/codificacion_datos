import type { SymbolFrequency, SymbolCode } from "../../types/compression";

interface SymbolCodeTableProps {
  frequencies: SymbolFrequency[];
  huffmanCodes: SymbolCode[];
  shannonFanoCodes: SymbolCode[];
}

export default function SymbolCodeTable({ frequencies, huffmanCodes, shannonFanoCodes }: SymbolCodeTableProps) {
  const huffmanMap  = Object.fromEntries(huffmanCodes.map((c) => [c.symbol, c]));
  const sfMap       = Object.fromEntries(shannonFanoCodes.map((c) => [c.symbol, c]));
  const total       = frequencies.reduce((s, f) => s + f.frequency, 0);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 bg-slate-50 text-left px-3 py-2 text-slate-500 font-medium border-b border-slate-100">Simb.</th>
            <th className="sticky top-0 bg-slate-50 text-right px-3 py-2 text-slate-500 font-medium border-b border-slate-100">Frec.</th>
            <th className="sticky top-0 bg-slate-50 text-right px-3 py-2 text-slate-500 font-medium border-b border-slate-100">%</th>
            <th className="sticky top-0 bg-blue-50 text-left px-3 py-2 text-blue-600 font-semibold border-b border-blue-100">Huffman</th>
            <th className="sticky top-0 bg-blue-50 text-right px-3 py-2 text-blue-600 font-semibold border-b border-blue-100">n</th>
            <th className="sticky top-0 bg-violet-50 text-left px-3 py-2 text-violet-600 font-semibold border-b border-violet-100">Shannon-Fano</th>
            <th className="sticky top-0 bg-violet-50 text-right px-3 py-2 text-violet-600 font-semibold border-b border-violet-100">n</th>
          </tr>
        </thead>
        <tbody>
          {frequencies.map((item, idx) => {
            const h  = huffmanMap[item.symbol];
            const sf = sfMap[item.symbol];
            const pct = ((item.frequency / total) * 100).toFixed(1);
            const isEven = idx % 2 === 0;
            return (
              <tr key={item.symbol} className={`group ${isEven ? "bg-white" : "bg-slate-50/50"} hover:bg-blue-50/30 transition-colors`}>
                <td className="px-3 py-1.5 font-mono font-semibold text-slate-700 border-b border-slate-100/60">
                  {item.symbol === " " ? <span className="text-slate-300 text-xs italic">espacio</span> : item.symbol}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-500 border-b border-slate-100/60">{item.frequency}</td>
                <td className="px-3 py-1.5 text-right tabular-nums border-b border-slate-100/60">
                  <span className="text-slate-400">{pct}%</span>
                </td>
                <td className="px-3 py-1.5 font-mono text-blue-600 border-b border-slate-100/60 tracking-wider">{h?.code ?? "—"}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-blue-400 border-b border-slate-100/60">{h?.length ?? "—"}</td>
                <td className="px-3 py-1.5 font-mono text-violet-600 border-b border-slate-100/60 tracking-wider">{sf?.code ?? "—"}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-violet-400 border-b border-slate-100/60">{sf?.length ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
