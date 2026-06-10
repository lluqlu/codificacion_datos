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
    <div className="overflow-auto h-full -m-1">
      <table className="w-full text-[12px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 bg-white text-left px-3 py-2 font-medium" style={{ color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>Metrica</th>
            <th className="sticky top-0 bg-white text-right px-3 py-2 font-semibold" style={{ color: "#2563eb", borderBottom: "1px solid #f3f4f6" }}>Huffman</th>
            <th className="sticky top-0 bg-white text-right px-3 py-2 font-semibold" style={{ color: "#7c3aed", borderBottom: "1px solid #f3f4f6" }}>Shannon-Fano</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.label}
              className="transition-colors"
              style={{ background: idx % 2 === 0 ? "#ffffff" : "#fafafa" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "#ffffff" : "#fafafa"; }}
            >
              <td className="px-3 py-2.5 font-medium" style={{ color: "#374151", borderBottom: "1px solid #f9fafb" }}>{row.label}</td>
              <td
                className="px-3 py-2.5 text-right font-mono tabular-nums"
                style={{
                  borderBottom: "1px solid #f9fafb",
                  color: row.winner === "h" ? "#1d4ed8" : "#9ca3af",
                  fontWeight: row.winner === "h" ? 600 : 400,
                }}
              >
                {row.h}
              </td>
              <td
                className="px-3 py-2.5 text-right font-mono tabular-nums"
                style={{
                  borderBottom: "1px solid #f9fafb",
                  color: row.winner === "sf" ? "#6d28d9" : "#9ca3af",
                  fontWeight: row.winner === "sf" ? 600 : 400,
                }}
              >
                {row.sf}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
