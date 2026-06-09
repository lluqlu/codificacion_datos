import type { SymbolFrequency, SymbolCode } from "../../types/compression";

interface SymbolCodeTableProps {
  frequencies: SymbolFrequency[];
  huffmanCodes: SymbolCode[];
  shannonFanoCodes: SymbolCode[];
}

export default function SymbolCodeTable({ frequencies, huffmanCodes, shannonFanoCodes }: SymbolCodeTableProps) {
  const huffmanMap = Object.fromEntries(huffmanCodes.map((c) => [c.symbol, c]));
  const sfMap = Object.fromEntries(shannonFanoCodes.map((c) => [c.symbol, c]));

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs text-slate-700">
        <thead className="sticky top-0 bg-slate-50">
          <tr>
            <th className="text-left px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Simbolo</th>
            <th className="text-right px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Frec.</th>
            <th className="text-left px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Huffman</th>
            <th className="text-right px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Lon.</th>
            <th className="text-left px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Shannon-Fano</th>
            <th className="text-right px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Lon.</th>
          </tr>
        </thead>
        <tbody>
          {frequencies.map((item) => {
            const h = huffmanMap[item.symbol];
            const sf = sfMap[item.symbol];
            return (
              <tr key={item.symbol} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-2 py-1.5 font-mono">
                  {item.symbol === " " ? <span className="text-slate-400 italic">espacio</span> : item.symbol}
                </td>
                <td className="px-2 py-1.5 text-right text-slate-500">{item.frequency}</td>
                <td className="px-2 py-1.5 font-mono text-blue-700">{h?.code ?? "-"}</td>
                <td className="px-2 py-1.5 text-right text-slate-500">{h?.length ?? "-"}</td>
                <td className="px-2 py-1.5 font-mono text-violet-700">{sf?.code ?? "-"}</td>
                <td className="px-2 py-1.5 text-right text-slate-500">{sf?.length ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
