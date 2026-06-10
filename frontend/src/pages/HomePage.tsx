import { useState, useRef } from "react";
import { FileDown, TableIcon, Copy, Check, BrainCircuit } from "lucide-react";
import type { SymbolCode } from "../types/compression";
import { useCompression } from "../app/CompressionContext";
import { generatePDF } from "../services/pdfExport";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import TextInputPanel from "../components/forms/TextInputPanel";
import SymbolCodeTable from "../components/tables/SymbolCodeTable";
import ComparisonTable from "../components/tables/ComparisonTable";
import FrequencyChart from "../components/charts/FrequencyChart";
import HuffmanTreeView from "../components/trees/HuffmanTreeView";
import { encodeText, encodeFile } from "../services/compressionApi";
import type { EncodeResponse } from "../types/compression";

type Status = "idle" | "loading" | "success" | "error";

function buildCodesTable(codes: SymbolCode[]): string {
  return codes.map((c) => `${c.symbol}=${c.code}`).join("\n");
}

interface EncodedBlockProps {
  label: string;
  accent: "blue" | "violet";
  encoded: string;
  codes: SymbolCode[];
}

function EncodedBlock({ label, accent, encoded, codes }: EncodedBlockProps) {
  const [copied, setCopied] = useState<"encoded" | "table" | null>(null);

  function copy(type: "encoded" | "table") {
    navigator.clipboard.writeText(type === "encoded" ? encoded : buildCodesTable(codes)).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const pill =
    accent === "blue"
      ? { background: "rgba(59,130,246,0.1)", color: "#2563eb", border: "1px solid rgba(59,130,246,0.2)" }
      : { background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.2)" };

  const codeBg = accent === "blue" ? "rgba(239,246,255,0.6)" : "rgba(245,243,255,0.6)";
  const codeColor = accent === "blue" ? "#1d4ed8" : "#6d28d9";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={pill}>{label}</span>
        <div className="flex gap-1.5">
          {(["encoded", "table"] as const).map((type) => (
            <button
              key={type}
              onClick={() => copy(type)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-all"
              style={{
                border: "1px solid rgba(226,232,240,1)",
                color: copied === type ? "#10b981" : "#64748b",
                background: copied === type ? "rgba(16,185,129,0.05)" : "#fff",
              }}
            >
              {copied === type ? <Check size={10} /> : <Copy size={10} />}
              {copied === type ? "Copiado" : type === "encoded" ? "Codigo" : "Tabla"}
            </button>
          ))}
        </div>
      </div>
      <p
        className="text-xs font-mono break-all leading-relaxed px-3 py-2 rounded-lg max-h-14 overflow-auto"
        style={{ background: codeBg, color: codeColor, border: "1px solid rgba(226,232,240,0.6)" }}
      >
        {encoded}
      </p>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: "blue" | "violet" | "slate";
  winner?: boolean;
}

function KpiCard({ label, value, sub, accent, winner = false }: KpiCardProps) {
  const styles = {
    blue: {
      bg: "linear-gradient(135deg, rgba(239,246,255,0.9) 0%, rgba(224,242,254,0.6) 100%)",
      border: "1px solid rgba(147,197,253,0.5)",
      valueColor: "#1d4ed8",
      dot: "#3b82f6",
      dotGlow: "rgba(59,130,246,0.4)",
    },
    violet: {
      bg: "linear-gradient(135deg, rgba(245,243,255,0.9) 0%, rgba(237,233,254,0.6) 100%)",
      border: "1px solid rgba(196,181,253,0.5)",
      valueColor: "#6d28d9",
      dot: "#8b5cf6",
      dotGlow: "rgba(139,92,246,0.4)",
    },
    slate: {
      bg: "linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,0.6) 100%)",
      border: "1px solid rgba(203,213,225,0.6)",
      valueColor: "#334155",
      dot: "#94a3b8",
      dotGlow: "none",
    },
  }[accent];

  return (
    <div
      className="relative rounded-2xl px-4 py-3.5 flex flex-col gap-1.5"
      style={{ background: styles.bg, border: styles.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {winner && (
        <span
          className="absolute top-2.5 right-2.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          mejor
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: styles.dot, boxShadow: `0 0 5px ${styles.dotGlow}` }}
        />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: styles.valueColor }}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function exportCSV(data: EncodeResponse) {
  const hMap  = Object.fromEntries(data.huffman.codes.map((c) => [c.symbol, c]));
  const sfMap = Object.fromEntries(data.shannonFano.codes.map((c) => [c.symbol, c]));
  const rows  = [
    ["Simbolo", "Frecuencia", "Codigo Huffman", "Long. Huffman", "Codigo Shannon-Fano", "Long. Shannon-Fano"],
    ...data.frequencies.map((f) => [
      f.symbol === " " ? "[espacio]" : f.symbol,
      f.frequency,
      hMap[f.symbol]?.code ?? "",
      hMap[f.symbol]?.length ?? "",
      sfMap[f.symbol]?.code ?? "",
      sfMap[f.symbol]?.length ?? "",
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
  const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "codificacion_resultados.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function HomePage() {
  const { text, setText, result, setResult, addEncodeEntry } = useCompression();
  const [status, setStatus]         = useState<Status>(result ? "success" : "idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const treeRef  = useRef<HTMLDivElement>(null);

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try { await generatePDF(result, chartRef, treeRef); }
    finally { setPdfLoading(false); }
  }

  async function handleEncode() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await encodeText(text);
      setResult(data);
      addEncodeEntry(text, data);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al codificar");
      setStatus("error");
    }
  }

  async function handleFileLoad(file: File) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await encodeFile(file);
      setText(data.original.text);
      setResult(data);
      addEncodeEntry(data.original.text, data);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al cargar archivo");
      setStatus("error");
    }
  }

  const hBetter  = result ? result.huffman.compressedBits <= result.shannonFano.compressedBits : false;
  const sfBetter = result ? result.shannonFano.compressedBits < result.huffman.compressedBits : false;

  const statusMessage =
    status === "idle"    ? "Ingrese texto o cargue un archivo para comenzar"
    : status === "loading" ? "Procesando..."
    : status === "error"   ? errorMsg
    : `Codificacion completada — ${result?.original.characters} caracteres procesados`;

  const btnBase = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all";

  return (
    <>
      <Topbar
        title="Inicio"
        subtitle="Huffman / Shannon-Fano"
        actions={
          result && (
            <>
              <button
                className={btnBase}
                style={{ border: "1px solid rgba(226,232,240,1)", color: "#475569", background: "#fff" }}
                onClick={() => exportCSV(result)}
              >
                <TableIcon size={12} /> CSV
              </button>
              <button
                className={btnBase}
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  opacity: pdfLoading ? 0.5 : 1,
                }}
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
              >
                <FileDown size={12} /> {pdfLoading ? "Generando..." : "PDF"}
              </button>
            </>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-5">

        {/* Entrada */}
        <div
          className="flex flex-col"
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
            padding: "20px 20px 16px",
            minHeight: 152,
          }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#94a3b8" }}>
            Entrada de texto
          </p>
          <TextInputPanel
            value={text}
            onChange={setText}
            onEncode={handleEncode}
            onFileLoad={handleFileLoad}
            loading={status === "loading"}
          />
        </div>

        {status === "error" && errorMsg && (
          <div
            className="px-4 py-3 text-sm rounded-xl"
            style={{ background: "rgba(254,242,242,0.9)", border: "1px solid rgba(252,165,165,0.4)", color: "#dc2626" }}
          >
            {errorMsg}
          </div>
        )}

        {/* Empty state */}
        {!result && status !== "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(241,245,249,0.8)", border: "1px solid rgba(226,232,240,0.6)" }}
            >
              <BrainCircuit size={24} style={{ color: "#cbd5e1" }} />
            </div>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Los resultados apareceran aqui despues de codificar
            </p>
          </div>
        )}

        {result && (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-5 gap-3">
              <KpiCard label="Original"             value={`${result.original.bits} bits`}              sub={`${result.original.characters} caracteres`}        accent="slate" />
              <KpiCard label="Huffman — comprimido" value={`${result.huffman.compressedBits} bits`}     sub={`-${result.huffman.compressionRate}% reduccion`}    accent="blue"   winner={hBetter} />
              <KpiCard label="Shannon-Fano"         value={`${result.shannonFano.compressedBits} bits`} sub={`-${result.shannonFano.compressionRate}% reduccion`} accent="violet" winner={sfBetter} />
              <KpiCard label="Efic. Huffman"        value={`${result.huffman.efficiency}%`}             sub={`avg ${result.huffman.averageLength} bits/simb.`}   accent="blue" />
              <KpiCard label="Efic. Shannon-Fano"   value={`${result.shannonFano.efficiency}%`}         sub={`avg ${result.shannonFano.averageLength} bits/simb.`} accent="violet" />
            </div>

            {/* Central: tabla | arbol | frecuencias */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.7fr 1fr", height: 340 }}>
              <Panel title="Simbolos y codigos" accent="blue">
                <SymbolCodeTable
                  frequencies={result.frequencies}
                  huffmanCodes={result.huffman.codes}
                  shannonFanoCodes={result.shannonFano.codes}
                />
              </Panel>

              <div ref={treeRef} className="flex flex-col" style={{ minHeight: 0 }}>
                <Panel title="Arbol de Huffman" accent="blue" className="flex-1">
                  <HuffmanTreeView tree={result.huffman.tree} />
                </Panel>
              </div>

              <div ref={chartRef} className="flex flex-col" style={{ minHeight: 0 }}>
                <Panel title="Frecuencias por simbolo" accent="violet" className="flex-1">
                  <FrequencyChart frequencies={result.frequencies} />
                </Panel>
              </div>
            </div>

            {/* Bottom: comparacion + codigos */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Panel title="Comparacion de metricas" accent="slate">
                <ComparisonTable data={result} />
              </Panel>

              <Panel title="Codigos comprimidos generados">
                <div className="flex flex-col gap-4">
                  <EncodedBlock accent="blue"   label="Huffman"      encoded={result.huffman.encoded}     codes={result.huffman.codes} />
                  <EncodedBlock accent="violet" label="Shannon-Fano" encoded={result.shannonFano.encoded} codes={result.shannonFano.codes} />
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>

      <StatusBar
        status={status}
        message={statusMessage}
        activeAlgorithm={result ? "Huffman + Shannon-Fano" : undefined}
      />
    </>
  );
}
