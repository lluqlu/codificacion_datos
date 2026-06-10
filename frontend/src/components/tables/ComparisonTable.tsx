import type { EncodeResponse } from "../../types/compression";

interface ComparisonTableProps {
  data: EncodeResponse;
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const rows = [
    {
      label: "Tamano original",
      h:  `${data.original.bits} bits`,
      sf: `${data.original.bits} bits`,
    },
    {
      label: "Tamano comprimido",
      h:  `${data.huffman.compressedBits} bits`,
      sf: `${data.shannonFano.compressedBits} bits`,
      winner: data.huffman.compressedBits <= data.shannonFano.compressedBits ? "h" : "sf",
    },
    {
      label: "Reduccion",
      h:  `${data.huffman.compressionRate}%`,
      sf: `${data.shannonFano.compressionRate}%`,
      winner: data.huffman.compressionRate >= data.shannonFano.compressionRate ? "h" : "sf",
    },
    {
      label: "Long. promedio",
      h:  `${data.huffman.averageLength} bits/simb.`,
      sf: `${data.shannonFano.averageLength} bits/simb.`,
      winner: data.huffman.averageLength <= data.shannonFano.averageLength ? "h" : "sf",
    },
    {
      label: "Eficiencia",
      h:  `${data.huffman.efficiency}%`,
      sf: `${data.shannonFano.efficiency}%`,
      winner: data.huffman.efficiency >= data.shannonFano.efficiency ? "h" : "sf",
    },
  ];

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 bg-slate-50 text-left px-3 py-2 text-slate-500 font-medium border-b border-slate-100">Metrica</th>
            <th className="sticky top-0 bg-blue-50 text-right px-3 py-2 text-blue-600 font-semibold border-b border-blue-100">Huffman</th>
            <th className="sticky top-0 bg-violet-50 text-right px-3 py-2 text-violet-600 font-semibold border-b border-violet-100">Shannon-Fano</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-blue-50/20 transition-colors`}>
              <td className="px-3 py-2.5 text-slate-600 border-b border-slate-100/60 font-medium">{row.label}</td>
              <td className={`px-3 py-2.5 text-right font-mono tabular-nums border-b border-slate-100/60 ${row.winner === "h" ? "text-blue-700 font-semibold" : "text-slate-500"}`}>
                {row.h}
              </td>
              <td className={`px-3 py-2.5 text-right font-mono tabular-nums border-b border-slate-100/60 ${row.winner === "sf" ? "text-violet-700 font-semibold" : "text-slate-500"}`}>
                {row.sf}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
