import type { EncodeResponse } from "../../types/compression";

interface ComparisonTableProps {
  data: EncodeResponse;
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const rows = [
    { label: "Tamano original", huffman: `${data.original.bits} bits`, sf: `${data.original.bits} bits` },
    { label: "Tamano comprimido", huffman: `${data.huffman.compressedBits} bits`, sf: `${data.shannonFano.compressedBits} bits` },
    { label: "Tasa de compresion", huffman: `${data.huffman.compressionRate}%`, sf: `${data.shannonFano.compressionRate}%` },
    { label: "Long. promedio de codigo", huffman: `${data.huffman.averageLength} bits/simbolo`, sf: `${data.shannonFano.averageLength} bits/simbolo` },
    { label: "Eficiencia", huffman: `${data.huffman.efficiency}%`, sf: `${data.shannonFano.efficiency}%` },
  ];

  return (
    <table className="w-full text-xs text-slate-700">
      <thead>
        <tr>
          <th className="text-left px-2 py-2 font-semibold text-slate-500 border-b border-slate-100">Metrica</th>
          <th className="text-right px-2 py-2 font-semibold text-blue-600 border-b border-slate-100">Huffman</th>
          <th className="text-right px-2 py-2 font-semibold text-violet-600 border-b border-slate-100">Shannon-Fano</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-slate-50 hover:bg-slate-50">
            <td className="px-2 py-2 text-slate-600">{row.label}</td>
            <td className="px-2 py-2 text-right font-mono text-blue-700">{row.huffman}</td>
            <td className="px-2 py-2 text-right font-mono text-violet-700">{row.sf}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
