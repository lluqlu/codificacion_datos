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
  const a    = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "codificacion_resultados.csv",
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color: "blue" | "violet" | "neutral";
  badge?: string;
}

function KpiCard({ label, value, sub, color, badge }: KpiCardProps) {
  const valueColor = color === "blue" ? "#1d4ed8" : color === "violet" ? "#6d28d9" : "#111827";
  const dotColor   = color === "blue" ? "#3b82f6" : color === "violet" ? "#8b5cf6" : "#9ca3af";
  return (
    <div
      className="flex flex-col px-4 py-3.5 relative"
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {badge && (
        <span
          className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          {badge}
        </span>
      )}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
        <p className="text-[11px] font-medium" style={{ color: "#6b7280" }}>{label}</p>
      </div>
      <p className="text-[22px] font-bold tabular-nums leading-none" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="text-[11px] mt-1.5" style={{ color: "#9ca3af" }}>{sub}</p>}
    </div>
  );
}

interface EncodedBlockProps {
  label: string;
  color: "blue" | "violet";
  encoded: string;
  codes: SymbolCode[];
}

function EncodedBlock({ label, color, encoded, codes }: EncodedBlockProps) {
  const [copied, setCopied] = useState<"encoded" | "table" | null>(null);

  function copy(type: "encoded" | "table") {
    navigator.clipboard.writeText(type === "encoded" ? encoded : buildCodesTable(codes)).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const textColor = color === "blue" ? "#1d4ed8" : "#6d28d9";
  const bgColor   = color === "blue" ? "#eff6ff" : "#f5f3ff";
  const tagColor  = color === "blue" ? { bg: "rgba(37,99,235,0.08)", text: "#2563eb", border: "rgba(37,99,235,0.15)" }
                                      : { bg: "rgba(109,40,217,0.08)", text: "#7c3aed", border: "rgba(109,40,217,0.15)" };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: tagColor.bg, color: tagColor.text, border: `1px solid ${tagColor.border}` }}
        >
          {label}
        </span>
        <div className="flex gap-1.5">
          {(["encoded", "table"] as const).map((type) => (
            <button
              key={type}
              onClick={() => copy(type)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md transition-all"
              style={{
                border: "1px solid #e5e7eb",
                color: copied === type ? "#16a34a" : "#6b7280",
                background: copied === type ? "rgba(34,197,94,0.05)" : "#ffffff",
              }}
            >
              {copied === type ? <Check size={10} /> : <Copy size={10} />}
              {copied === type ? "Copiado" : type === "encoded" ? "Codigo" : "Tabla"}
            </button>
          ))}
        </div>
      </div>
      <p
        className="text-[11px] font-mono break-all leading-relaxed px-3 py-2 rounded-lg max-h-14 overflow-auto"
        style={{ background: bgColor, color: textColor, border: "1px solid rgba(0,0,0,0.05)" }}
      >
        {encoded}
      </p>
    </div>
  );
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

  return (
    <>
      <Topbar
        title="Inicio"
        subtitle="Huffman / Shannon-Fano"
        actions={
          result && (
            <>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
                style={{ border: "1px solid #e5e7eb", color: "#4b5563", background: "#fff" }}
                onClick={() => exportCSV(result)}
              >
                <TableIcon size={12} /> CSV
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all"
                style={{
                  background: "#111827",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  opacity: pdfLoading ? 0.55 : 1,
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

      <div className="flex-1 overflow-auto" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hero input */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid #f3f4f6" }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>
              Texto de entrada
            </span>
            {text.length > 0 && (
              <span className="text-[11px] tabular-nums" style={{ color: "#c4cdd8" }}>
                {text.length.toLocaleString()} chars · {(text.length * 8).toLocaleString()} bits
              </span>
            )}
          </div>
          <div className="px-5 py-4">
            <TextInputPanel
              value={text}
              onChange={setText}
              onEncode={handleEncode}
              onFileLoad={handleFileLoad}
              loading={status === "loading"}
            />
          </div>
        </div>

        {/* Error */}
        {status === "error" && errorMsg && (
          <div
            className="px-4 py-3 text-[13px] rounded-xl"
            style={{ background: "rgba(254,242,242,0.9)", border: "1px solid rgba(252,165,165,0.4)", color: "#dc2626" }}
          >
            {errorMsg}
          </div>
        )}

        {/* Empty state */}
        {!result && status !== "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
            >
              <BrainCircuit size={22} style={{ color: "#e5e7eb" }} />
            </div>
            <p className="text-[13px]" style={{ color: "#9ca3af" }}>
              Los resultados apareceran aqui despues de codificar
            </p>
          </div>
        )}

        {result && (
          <>
            {/* KPI strip — 6 cards */}
            <div className="grid grid-cols-6 gap-3">
              <KpiCard
                label="Caracteres"
                value={result.original.characters.toString()}
                sub={`${result.original.bits} bits orig.`}
                color="neutral"
              />
              <KpiCard
                label="Huffman bits"
                value={result.huffman.compressedBits.toString()}
                sub={`-${result.huffman.compressionRate}% reduccion`}
                color="blue"
                badge={hBetter ? "mejor" : undefined}
              />
              <KpiCard
                label="Shannon-Fano bits"
                value={result.shannonFano.compressedBits.toString()}
                sub={`-${result.shannonFano.compressionRate}% reduccion`}
                color="violet"
                badge={sfBetter ? "mejor" : undefined}
              />
              <KpiCard
                label="Efic. Huffman"
                value={`${result.huffman.efficiency}%`}
                sub={`avg ${result.huffman.averageLength} b/simb.`}
                color="blue"
              />
              <KpiCard
                label="Efic. Shannon-Fano"
                value={`${result.shannonFano.efficiency}%`}
                sub={`avg ${result.shannonFano.averageLength} b/simb.`}
                color="violet"
              />
              <KpiCard
                label="Simbolos unicos"
                value={result.frequencies.length.toString()}
                sub="en el texto"
                color="neutral"
              />
            </div>

            {/* Main grid: tabla | arbol (protagonista) | grafico */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 2.4fr 1.1fr", height: 420 }}>
              <Panel title="Simbolos y codigos">
                <SymbolCodeTable
                  frequencies={result.frequencies}
                  huffmanCodes={result.huffman.codes}
                  shannonFanoCodes={result.shannonFano.codes}
                />
              </Panel>

              <div ref={treeRef} className="flex flex-col" style={{ minHeight: 0 }}>
                <Panel title="Arbol de Huffman" className="flex-1">
                  <HuffmanTreeView tree={result.huffman.tree} />
                </Panel>
              </div>

              <div ref={chartRef} className="flex flex-col" style={{ minHeight: 0 }}>
                <Panel title="Frecuencias" className="flex-1">
                  <FrequencyChart frequencies={result.frequencies} />
                </Panel>
              </div>
            </div>

            {/* Bottom: comparacion + codigos */}
            <div className="grid grid-cols-2 gap-4">
              <Panel title="Comparacion de metricas">
                <ComparisonTable data={result} />
              </Panel>

              <Panel title="Codigos generados">
                <div className="flex flex-col gap-4">
                  <EncodedBlock color="blue"   label="Huffman"      encoded={result.huffman.encoded}     codes={result.huffman.codes} />
                  <EncodedBlock color="violet" label="Shannon-Fano" encoded={result.shannonFano.encoded} codes={result.shannonFano.codes} />
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
